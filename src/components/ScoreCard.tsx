import type { MatchAnalysis } from "@/lib/orders/types";

function scoreTone(score: number): string {
  if (score >= 75) return "var(--color-accent-strong)";
  if (score >= 50) return "var(--color-ink)";
  return "var(--color-danger)";
}

export function ScoreCard({ analysis }: { analysis: MatchAnalysis }) {
  return (
    <section
      aria-label="Your CV match score"
      className="border border-[color:var(--color-rule)] bg-[color:var(--color-paper-raised)] shadow-[0_1px_0_var(--color-rule),0_12px_32px_-24px_rgb(0_0_0/0.35)]"
    >
      <div className="flex items-end justify-between gap-4 border-b border-[color:var(--color-rule)] p-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faint)]">
            Match score for this job
          </p>
          <p className="mt-2 text-[15px] leading-snug">{analysis.verdict}</p>
        </div>
        <p
          className="font-[family-name:var(--font-display)] text-6xl leading-none"
          style={{ color: scoreTone(analysis.matchScore) }}
        >
          {Math.round(analysis.matchScore)}
          <span className="text-xl text-[color:var(--color-ink-faint)]">/100</span>
        </p>
      </div>

      <div className="p-6">
        <p className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faint)]">
          What&apos;s holding you back
        </p>
        <ul className="mt-3 space-y-3">
          {analysis.topGaps.map((gap) => (
            <li
              key={gap}
              className="border-l-2 border-[color:var(--color-danger)] pl-3 text-[15px] italic leading-snug text-[color:var(--color-ink-muted)]"
            >
              {gap}
            </li>
          ))}
        </ul>

        {analysis.strengths.length > 0 && (
          <>
            <p className="mt-6 text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faint)]">
              Worth keeping front and centre
            </p>
            <ul className="mt-3 space-y-3">
              {analysis.strengths.map((strength) => (
                <li
                  key={strength}
                  className="border-l-2 border-[color:var(--color-accent)] pl-3 text-[15px] italic leading-snug text-[color:var(--color-accent-strong)]"
                >
                  {strength}
                </li>
              ))}
            </ul>
          </>
        )}

        {analysis.keywordsMissing.length > 0 && (
          <p className="mt-6 text-[13px] leading-relaxed text-[color:var(--color-ink-faint)]">
            Also missing {analysis.keywordsMissing.length} keywords the
            screening software looks for
            {analysis.keywordsMissing.length > 3
              ? `, including "${analysis.keywordsMissing.slice(0, 3).join('", "')}".`
              : `: "${analysis.keywordsMissing.join('", "')}".`}
          </p>
        )}
      </div>
    </section>
  );
}
