import { seriesColor } from "@/lib/chart";
import { formatMonths } from "@/lib/format";
import { ANALYSIS_MONTHS, type RoiResult } from "@/lib/roi";

type Props = {
  results: RoiResult[];
};

/**
 * 카드 여러 개를 눈으로 비교하며 암산하지 않아도 되도록,
 * "그래서 뭐가 낫다"는 결론을 한 문장으로 먼저 보여준다.
 * 장비가 1개뿐이면 비교할 대상이 없으므로 표시하지 않는다.
 */
export default function ComparisonHeadline({ results }: Props) {
  if (results.length < 2) {
    return null;
  }

  const sorted = [...results].sort((a, b) => {
    if (a.paybackMonths === null) return 1;
    if (b.paybackMonths === null) return -1;
    return a.paybackMonths - b.paybackMonths;
  });
  const [winner, runnerUp] = sorted;

  if (winner.paybackMonths === null) {
    return (
      <p className="print-card rounded-lg border border-[var(--hairline)] bg-surface px-4 py-3 text-sm font-semibold">
        입력한 조건으로는 {ANALYSIS_MONTHS}개월 안에 회수되는 장비가 없습니다.
      </p>
    );
  }

  const diff =
    runnerUp && runnerUp.paybackMonths !== null
      ? runnerUp.paybackMonths - winner.paybackMonths
      : null;

  let message: string;
  if (diff === null) {
    message = `${winner.input.name}만 ${ANALYSIS_MONTHS}개월 안에 회수됩니다.`;
  } else if (diff < 0.05) {
    message = `${winner.input.name}와(과) ${runnerUp.input.name}의 회수기간이 비슷합니다.`;
  } else {
    message = `${winner.input.name}이(가) ${runnerUp.input.name}보다 ${formatMonths(diff)} 빠르게 회수됩니다.`;
  }

  return (
    <p className="print-card flex items-center gap-2 rounded-lg border border-[var(--hairline)] bg-surface px-4 py-3 text-sm font-semibold">
      <span
        aria-hidden
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: seriesColor(winner.input.colorIndex) }}
      />
      {message}
    </p>
  );
}
