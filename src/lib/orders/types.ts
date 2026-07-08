export const PACKAGES = {
  cv: {
    id: "cv",
    name: "CV Rewrite",
    priceKobo: 350_000,
    includes: ["Rewritten CV tailored to the job", "ATS-safe PDF"],
  },
  cv_letter: {
    id: "cv_letter",
    name: "CV + Cover Letter",
    priceKobo: 500_000,
    includes: [
      "Rewritten CV tailored to the job",
      "Tailored cover letter",
      "ATS-safe PDFs",
    ],
  },
  premium: {
    id: "premium",
    name: "Premium",
    priceKobo: 1_000_000,
    includes: [
      "Rewritten CV tailored to the job",
      "Tailored cover letter",
      "LinkedIn About + headline rewrite",
      "ATS-safe PDFs",
    ],
  },
} as const;

export type PackageId = keyof typeof PACKAGES;

export type OrderStatus =
  | "created" // form submitted, CV uploaded
  | "analyzed" // free match score produced, awaiting payment
  | "paid" // payment verified, generation queued
  | "generating" // agent pipeline running
  | "delivered" // PDFs ready + email sent
  | "failed"; // pipeline error after payment (needs attention)

export interface MatchAnalysis {
  matchScore: number; // 0-100
  verdict: string; // one-sentence plain-language summary
  topGaps: string[]; // shown free as the conversion hook
  keywordsMissing: string[];
  strengths: string[];
}

export interface CvSection {
  heading: string;
  body: string; // markdown-lite: lines, "- " bullets
}

export interface GeneratedDocuments {
  cv: {
    fullName: string;
    headline: string;
    contactLine: string;
    sections: CvSection[];
  };
  coverLetter?: string;
  linkedin?: { headline: string; about: string };
}

export interface AgentLogEntry {
  at: string; // ISO timestamp
  step:
    | "extract"
    | "analyze"
    | "rewrite"
    | "cover_letter"
    | "linkedin"
    | "qa"
    | "render"
    | "deliver";
  decision: string; // what the agent decided/did, in plain language
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  durationMs: number;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  packageId: PackageId;
  customer: { name: string; email: string; whatsapp?: string };
  jobDescription: string;
  cvText: string; // extracted from upload
  analysis?: MatchAnalysis;
  documents?: GeneratedDocuments;
  payment?: {
    reference: string;
    amountKobo: number;
    paidAt?: string;
    channel?: string;
  };
  agentLog: AgentLogEntry[];
  error?: string;
}
