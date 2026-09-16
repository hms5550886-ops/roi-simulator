import { seriesColor } from "@/lib/chart";
import { formatCount, formatMoney } from "@/lib/format";
import { ANALYSIS_MONTHS, type RoiResult } from "@/lib/roi";

type Row = {
  label: string;
  value: (result: RoiResult) => string;
  strong?: boolean;
};

const CONDITION_ROWS: Row[] = [
  { label: "장비 도입가", value: (r) => formatMoney(r.input.price) },
  { label: "1회 시술가", value: (r) => formatMoney(r.input.treatmentPrice) },
  { label: "월 시술 건수", value: (r) => formatCount(r.input.monthlyCases, "회") },
  {
    label: "소모품 단가",
    value: (r) => `${formatMoney(r.input.consumableCost)}/회`,
  },
  {
    label: "소모품 무상 제공",
    value: (r) => formatCount(r.input.freeConsumables, "회"),
  },
  { label: "월 고정비", value: (r) => formatMoney(r.input.monthlyFixedCost) },
];

// 회수기간·월 순이익·ROI는 위쪽 카드에 이미 있으므로 표에는 넣지 않는다.
const RESULT_ROWS: Row[] = [
  { label: "월 매출", value: (r) => formatMoney(r.monthlyRevenue) },
  {
    label: `${ANALYSIS_MONTHS}개월 누적 손익`,
    value: (r) => formatMoney(r.netAfterPeriod),
    strong: true,
  },
];

type Props = {
  results: RoiResult[];
};

/** 입력 조건과 계산 결과를 한 표로 비교한다. 그래프를 읽기 어려울 때의 대조표 역할도 한다. */
export default function ComparisonTable({ results }: Props) {
  const renderSection = (title: string, rows: Row[]) => (
    <>
      <tr>
        <th
          colSpan={results.length + 1}
          scope="colgroup"
          className="bg-plane px-3 py-1.5 text-left text-xs font-semibold text-ink-secondary"
        >
          {title}
        </th>
      </tr>
      {rows.map((row) => (
        <tr key={row.label} className="border-t border-[var(--hairline)]">
          <th
            scope="row"
            className="px-3 py-1.5 text-left text-xs font-normal text-ink-secondary"
          >
            {row.label}
          </th>
          {results.map((result) => (
            <td
              key={result.input.id}
              className={`px-3 py-1.5 text-right text-sm tabular-nums ${
                row.strong ? "font-semibold" : ""
              }`}
            >
              {row.value(result)}
            </td>
          ))}
        </tr>
      ))}
    </>
  );

  return (
    <div className="print-card overflow-x-auto rounded-lg border border-[var(--hairline)] bg-surface">
      <table className="w-full border-collapse">
        <caption className="px-3 pt-4 pb-2 text-left text-sm font-semibold">
          조건·결과 비교표
        </caption>
        <thead>
          <tr className="border-t border-[var(--hairline)]">
            <th scope="col" className="w-44 px-3 py-2 text-left text-xs text-ink-muted">
              항목
            </th>
            {results.map((result) => (
              <th
                key={result.input.id}
                scope="col"
                className="px-3 py-2 text-right text-sm font-semibold"
              >
                <span className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: seriesColor(result.input.colorIndex) }}
                  />
                  {result.input.name}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {renderSection("입력 조건", CONDITION_ROWS)}
          {renderSection("계산 결과", RESULT_ROWS)}
        </tbody>
      </table>
    </div>
  );
}
