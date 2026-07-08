import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { orderStore } from "@/lib/orders/store";
import {
  buildCvPdf,
  buildCoverLetterPdf,
  type PdfElement,
} from "@/lib/pdf/documents";

export const maxDuration = 60;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const doc = request.nextUrl.searchParams.get("doc") ?? "cv";

  const order = await orderStore.get(id);
  if (!order?.documents || order.status !== "delivered") {
    return NextResponse.json(
      { success: false, error: "Documents are not ready yet." },
      { status: 404 },
    );
  }

  const { cv } = order.documents;
  const surname = cv.fullName.split(" ").pop() ?? "SabiCV";

  let element: PdfElement;
  let filename: string;

  if (doc === "letter" && order.documents.coverLetter) {
    element = buildCoverLetterPdf({
      fullName: cv.fullName,
      contactLine: cv.contactLine,
      letter: order.documents.coverLetter,
    });
    filename = `${surname}-Cover-Letter.pdf`;
  } else if (doc === "cv") {
    element = buildCvPdf(cv);
    filename = `${surname}-CV.pdf`;
  } else {
    return NextResponse.json(
      { success: false, error: "Unknown document." },
      { status: 404 },
    );
  }

  const buffer = await renderToBuffer(element);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
