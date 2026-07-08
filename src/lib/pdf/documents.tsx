import React from "react";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  type DocumentProps,
} from "@react-pdf/renderer";
import type { GeneratedDocuments } from "../orders/types";

export type PdfElement = React.ReactElement<DocumentProps>;

export function buildCvPdf(cv: GeneratedDocuments["cv"]): PdfElement {
  return (<CvPdf cv={cv} />) as PdfElement;
}

export function buildCoverLetterPdf(params: {
  fullName: string;
  contactLine: string;
  letter: string;
}): PdfElement {
  return (<CoverLetterPdf {...params} />) as PdfElement;
}

/**
 * ATS-safe PDF layouts: single column, real text, standard font (Helvetica),
 * no tables/graphics that trip parsers. Deliberately restrained — recruiters
 * read content, ATS reads structure.
 */

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.45,
    paddingVertical: 48,
    paddingHorizontal: 52,
    color: "#1a1a1a",
  },
  name: { fontSize: 20, fontFamily: "Helvetica-Bold", letterSpacing: 0.3 },
  headline: { fontSize: 10.5, marginTop: 3, color: "#333333" },
  contact: { fontSize: 9, marginTop: 5, color: "#444444" },
  sectionHeading: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 5,
    paddingBottom: 3,
    borderBottomWidth: 0.75,
    borderBottomColor: "#1a1a1a",
  },
  paragraph: { marginBottom: 3 },
  bulletRow: { flexDirection: "row", marginBottom: 2.5 },
  bulletGlyph: { width: 12 },
  bulletText: { flex: 1 },
  letterBody: { fontSize: 10.5, marginTop: 24 },
  letterParagraph: { marginBottom: 10 },
});

function SectionBody({ body }: { body: string }) {
  const lines = body.split("\n").filter((line) => line.trim().length > 0);
  return (
    <View>
      {lines.map((line, i) =>
        line.trim().startsWith("- ") ? (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.bulletGlyph}>•</Text>
            <Text style={styles.bulletText}>{line.trim().slice(2)}</Text>
          </View>
        ) : (
          <Text key={i} style={styles.paragraph}>
            {line.trim()}
          </Text>
        ),
      )}
    </View>
  );
}

export function CvPdf({ cv }: { cv: GeneratedDocuments["cv"] }) {
  return (
    <Document title={`${cv.fullName} — CV`} producer="SabiCV" creator="SabiCV">
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{cv.fullName}</Text>
        <Text style={styles.headline}>{cv.headline}</Text>
        <Text style={styles.contact}>{cv.contactLine}</Text>
        {cv.sections.map((section, i) => (
          <View key={i}>
            <Text style={styles.sectionHeading}>{section.heading}</Text>
            <SectionBody body={section.body} />
          </View>
        ))}
      </Page>
    </Document>
  );
}

export function CoverLetterPdf({
  fullName,
  contactLine,
  letter,
}: {
  fullName: string;
  contactLine: string;
  letter: string;
}) {
  const paragraphs = letter.split("\n").filter((p) => p.trim().length > 0);
  return (
    <Document title={`${fullName} — Cover Letter`} producer="SabiCV" creator="SabiCV">
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{fullName}</Text>
        <Text style={styles.contact}>{contactLine}</Text>
        <View style={styles.letterBody}>
          {paragraphs.map((paragraph, i) => (
            <Text key={i} style={styles.letterParagraph}>
              {paragraph.trim()}
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  );
}
