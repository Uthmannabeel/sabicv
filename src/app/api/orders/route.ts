import { NextRequest, NextResponse } from "next/server";
import { extractCvText, CvExtractionError } from "@/lib/agent/extract";
import { runAnalysis } from "@/lib/agent/pipeline";
import { orderStore } from "@/lib/orders/store";
import { PACKAGES, type PackageId } from "@/lib/orders/types";

export const maxDuration = 60;

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const MAX_JOB_DESCRIPTION_CHARS = 20_000;
const MIN_JOB_DESCRIPTION_CHARS = 100;

function badRequest(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 400 });
}

export async function POST(request: NextRequest) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return badRequest("Invalid form submission.");
  }

  const file = form.get("cv");
  const jobDescription = String(form.get("jobDescription") ?? "").trim();
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const whatsapp = String(form.get("whatsapp") ?? "").trim();
  const packageId = String(form.get("packageId") ?? "") as PackageId;

  if (!(file instanceof File)) return badRequest("Please upload your CV.");
  if (file.size > MAX_UPLOAD_BYTES)
    return badRequest("Your CV file is too large (max 5 MB).");
  if (!name) return badRequest("Please enter your name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return badRequest("Please enter a valid email address.");
  if (!(packageId in PACKAGES)) return badRequest("Please pick a package.");
  if (jobDescription.length < MIN_JOB_DESCRIPTION_CHARS)
    return badRequest(
      "Please paste the full job advert (the more detail, the better your rewrite).",
    );

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const cvText = await extractCvText(buffer, file.name);

    const order = await orderStore.create({
      status: "created",
      packageId,
      customer: { name, email, ...(whatsapp ? { whatsapp } : {}) },
      jobDescription: jobDescription.slice(0, MAX_JOB_DESCRIPTION_CHARS),
      cvText,
    });

    const analysis = await runAnalysis(order);

    return NextResponse.json({
      success: true,
      data: { orderId: order.id, analysis },
    });
  } catch (error) {
    if (error instanceof CvExtractionError) return badRequest(error.message);
    console.error("Order creation failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong on our side. Please try again.",
      },
      { status: 500 },
    );
  }
}
