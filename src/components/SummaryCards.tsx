import type { CSSProperties } from "react";
import { seriesColor } from "@/lib/chart";
import {
  formatCount,
  formatMoney,
  formatMonths,
  formatPercent,
} from "@/lib/format";
import { ANALYSIS_MONTHS, type RoiResult } from "@/lib/roi";

type Props = {
  results: RoiResult[];
};

/** 장비별 핵심 숫자(회수기간·월 순이익·ROI)를 한눈에 보여주는 카드. */
export default function SummaryCards({ results }: Props) {
  return (
    <div
      className="cols-by-count grid grid-cols-2 gap-3"
      style={{ "--cols": results.length } as CSSProperties}
    >
      {results.map((result) => (
        <div
          key={result.input.id}
          className="print-card rounded-lg border border-[var(--hairline)] bg-surface p-4"
        >
          <div className="mb-2 flex items-center gap-1.5">
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: seriesColor(result.input.colorIndex) }}
            />
            <span className="truncate text-xs text-ink-secondary">
              {result.input.name}
            </span>
          </div>

          {/* 1단계 — 3초 안에 봐야 하는 핵심: 회수기간과 그 결과로 남는 돈. */}
          <div className="text-xs text-ink-muted">투자 회수기간</div>
          <div className="text-3xl font-semibold">
            {formatMonths(result.paybackMonths)}
          </div>
          <div className="mt-2 flex gap-4 text-sm">
            <div>
              <div className="text-[11px] text-ink-muted">월 순이익</div>
              <div className="font-semibold tabular-nums">
                {formatMoney(result.steadyMonthlyProfit)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-ink-muted">
                {ANALYSIS_MONTHS}개월 ROI
              </div>
              <div className="font-semibold tabular-nums">
                {formatPercent(result.roiPercent)}
              </div>
            </div>
          </div>

          {/* 2단계 — 원장이 되물었을 때 근거로 꺼내는 값. 한 단계 낮은 무게로 묶는다. */}
          <div className="mt-3 space-y-1 rounded-md bg-plane px-2.5 py-2 text-[11px] text-ink-secondary">
            <div className="flex justify-between gap-2">
              <span>손익분기 건수</span>
              <span className="tabular-nums">
                {result.breakEvenCases === null
                  ? "-"
                  : `월 ${formatCount(result.breakEvenCases, "건")}`}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span>
                보수 {formatCount(result.scenarios.conservative.monthlyCases, "건")}
              </span>
              <span className="tabular-nums">
                {formatMonths(result.scenarios.conservative.paybackMonths)}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span>
                공격 {formatCount(result.scenarios.aggressive.monthlyCases, "건")}
              </span>
              <span className="tabular-nums">
                {formatMonths(result.scenarios.aggressive.paybackMonths)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
