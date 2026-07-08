import { generateJson } from "./gemini";
import {
  analyzePrompt,
  coverLetterPrompt,
  linkedinPrompt,
  qaPrompt,
  rewritePrompt,
} from "./prompts";
import {
  analysisSchema,
  coverLetterSchema,
  cvSchema,
  linkedinSchema,
  qaSchema,
} from "./schemas";
import { orderStore } from "../orders/store";
import type {
  AgentLogEntry,
  GeneratedDocuments,
  MatchAnalysis,
  Order,
} from "../orders/types";

interface QaResult {
  pass: boolean;
  fabrications: string[];
  notes: string;
}

async function logged<T>(
  orderId: string,
  step: AgentLogEntry["step"],
  decision: (result: T) => string,
  run: () => Promise<{
    data: T;
    model?: string;
    inputTokens?: number;
    outputTokens?: number;
  }>,
): Promise<T> {
  const startedAt = Date.now();
  const { data, model, inputTokens, outputTokens } = await run();
  await orderStore.appendLog(orderId, {
    at: new Date().toISOString(),
    step,
    decision: decision(data),
    model,
    inputTokens,
    outputTokens,
    durationMs: Date.now() - startedAt,
  });
  return data;
}

/**
 * Free pre-payment step: score the CV against the job. The result is the
 * conversion hook — score + gaps are shown before the paywall.
 */
export async function runAnalysis(order: Order): Promise<MatchAnalysis> {
  const analysis = await logged<MatchAnalysis>(
    order.id,
    "analyze",
    (a) =>
      `Scored CV ${a.matchScore}/100 against the job; identified ${a.topGaps.length} gaps and ${a.keywordsMissing.length} missing ATS keywords.`,
    () => generateJson(analyzePrompt(order.cvText, order.jobDescription), analysisSchema),
  );

  await orderStore.update(order.id, { status: "analyzed", analysis });
  return analysis;
}

/**
 * Post-payment pipeline: rewrite → cover letter → (linkedin) → QA gate.
 * A QA failure triggers one corrective rewrite before giving up.
 */
export async function runGeneration(orderId: string): Promise<Order> {
  const order = await orderStore.get(orderId);
  if (!order) throw new Error(`Order not found: ${orderId}`);
  if (order.status !== "paid") {
    throw new Error(`Order ${orderId} is not paid (status: ${order.status})`);
  }

  await orderStore.update(orderId, { status: "generating" });

  try {
    const documents = await generateDocuments(order);
    const qa = await runQaGate(order, documents);

    if (!qa.pass) {
      const retried = await generateDocuments(order, qa.fabrications);
      const retryQa = await runQaGate(order, retried);
      if (!retryQa.pass) {
        throw new Error(
          `QA gate failed twice; unresolved claims: ${retryQa.fabrications.join("; ")}`,
        );
      }
      return orderStore.update(orderId, { documents: retried });
    }

    return await orderStore.update(orderId, { documents });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await orderStore.update(orderId, { status: "failed", error: message });
    throw error;
  }
}

async function generateDocuments(
  order: Order,
  previousFabrications?: string[],
): Promise<GeneratedDocuments> {
  const integrityReminder = previousFabrications?.length
    ? `\n\nA previous draft was rejected for these unsupported claims — do not repeat them:\n- ${previousFabrications.join("\n- ")}`
    : "";

  const cv = await logged<GeneratedDocuments["cv"]>(
    order.id,
    "rewrite",
    (c) =>
      `Rewrote CV into ${c.sections.length} sections with headline "${c.headline}".`,
    () =>
      generateJson(
        rewritePrompt(order.cvText, order.jobDescription) + integrityReminder,
        cvSchema,
      ),
  );

  const documents: GeneratedDocuments = { cv };

  if (order.packageId === "cv_letter" || order.packageId === "premium") {
    const { coverLetter } = await logged<{ coverLetter: string }>(
      order.id,
      "cover_letter",
      () => "Wrote a tailored cover letter mapped to the job's requirements.",
      () =>
        generateJson(
          coverLetterPrompt(
            order.cvText,
            order.jobDescription,
            order.customer.name,
          ) + integrityReminder,
          coverLetterSchema,
        ),
    );
    documents.coverLetter = coverLetter;
  }

  if (order.packageId === "premium") {
    documents.linkedin = await logged<NonNullable<GeneratedDocuments["linkedin"]>>(
      order.id,
      "linkedin",
      () => "Rewrote LinkedIn headline and About section for the target role.",
      () =>
        generateJson(
          linkedinPrompt(order.cvText, order.jobDescription),
          linkedinSchema,
        ),
    );
  }

  return documents;
}

async function runQaGate(
  order: Order,
  documents: GeneratedDocuments,
): Promise<QaResult> {
  return logged<QaResult>(
    order.id,
    "qa",
    (q) =>
      q.pass
        ? `QA gate passed: ${q.notes}`
        : `QA gate REJECTED draft — ${q.fabrications.length} unsupported claims found; triggering corrective rewrite.`,
    () =>
      generateJson(
        qaPrompt(order.cvText, JSON.stringify(documents)),
        qaSchema,
        { temperature: 0 },
      ),
  );
}
