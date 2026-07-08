/**
 * Gemini structured-output schemas (Type enum values inlined as strings to
 * keep this file dependency-free for unit tests).
 */

const STRING = { type: "STRING" } as const;
const NUMBER = { type: "NUMBER" } as const;
const BOOLEAN = { type: "BOOLEAN" } as const;
const stringArray = { type: "ARRAY", items: STRING } as const;

export const analysisSchema = {
  type: "OBJECT",
  properties: {
    matchScore: NUMBER,
    verdict: STRING,
    topGaps: stringArray,
    keywordsMissing: stringArray,
    strengths: stringArray,
  },
  required: ["matchScore", "verdict", "topGaps", "keywordsMissing", "strengths"],
} as const;

export const cvSchema = {
  type: "OBJECT",
  properties: {
    fullName: STRING,
    headline: STRING,
    contactLine: STRING,
    sections: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { heading: STRING, body: STRING },
        required: ["heading", "body"],
      },
    },
  },
  required: ["fullName", "headline", "contactLine", "sections"],
} as const;

export const coverLetterSchema = {
  type: "OBJECT",
  properties: { coverLetter: STRING },
  required: ["coverLetter"],
} as const;

export const linkedinSchema = {
  type: "OBJECT",
  properties: { headline: STRING, about: STRING },
  required: ["headline", "about"],
} as const;

export const qaSchema = {
  type: "OBJECT",
  properties: {
    pass: BOOLEAN,
    fabrications: stringArray,
    notes: STRING,
  },
  required: ["pass", "fabrications", "notes"],
} as const;
