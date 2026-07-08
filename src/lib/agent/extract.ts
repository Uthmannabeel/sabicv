import { extractText, getDocumentProxy } from "unpdf";
import mammoth from "mammoth";

const MAX_CV_CHARS = 30_000;

export class CvExtractionError extends Error {}

/**
 * Extract plain text from an uploaded CV file (PDF or DOCX).
 * Throws CvExtractionError with a customer-friendly message on failure.
 */
export async function extractCvText(
  buffer: Buffer,
  filename: string,
): Promise<string> {
  const lower = filename.toLowerCase();
  const text = lower.endsWith(".pdf")
    ? await fromPdf(buffer)
    : lower.endsWith(".docx")
      ? await fromDocx(buffer)
      : null;

  if (text === null) {
    throw new CvExtractionError(
      "Please upload your CV as a PDF or Word (.docx) file.",
    );
  }

  const cleaned = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (cleaned.length < 200) {
    throw new CvExtractionError(
      "We couldn't read enough text from that file. If your CV is a scanned image, please upload a typed version.",
    );
  }
  return cleaned.slice(0, MAX_CV_CHARS);
}

async function fromPdf(buffer: Buffer): Promise<string> {
  try {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return text;
  } catch {
    throw new CvExtractionError(
      "That PDF couldn't be read. Please re-save it or upload a Word (.docx) version.",
    );
  }
}

async function fromDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch {
    throw new CvExtractionError(
      "That Word file couldn't be read. Please re-save it as .docx or PDF and try again.",
    );
  }
}
