import type { CSSProperties } from "react";
import { seriesColor } from "@/lib/chart";
import { formatCount, formatMoney, formatMonths } from "@/lib/format";
import type { RoiResult } from "@/lib/roi";

type Props = {
  results: RoiResult[];
};

/**
 * 무상 제공 소모품만으로 시술했을 때의 손익.
 * 소모품 비용이 들지 않으므로 비용은 장비 도입가뿐이며, 상담에서 가장 먼저 꺼내는 숫자다.
 */
export default function FreeConsumableCards({ results }: Props) {
  // 무상 제공이 있는 장비가 하나도 없으면 섹션을 보여주지 않는다.
  if (!results.some((result) => result.input.freeConsumables > 0)) {
    return null;
  }

  return (
    <section className="print-card rounded-lg border border-[var(--hairline)] bg-surface p-4">
      <h2 className="text-sm font-semibold">무상 제공 소모품 활용 수익</h2>
      <p className="mt-1 mb-3 text-xs text-ink-secondary">
        무료 제공 소모품만으로 시술했을 때의 손익입니다. 소모품 비용이 들지 않으므로
        비용은 장비 도입가만 반영합니다.
      </p>

      <div
        className="cols-by-count grid grid-cols-1 gap-3"
        style={{ "--cols": results.length } as CSSProperties}
      >
        {results.map((result) => {
          const hasFree = result.input.freeConsumables > 0;

          return (
            <div
              key={result.input.id}
              className="rounded-md border border-[var(--hairline)]"
            >
              <div className="flex items-center gap-1.5 border-b border-[var(--hairline)] px-3 py-2">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: seriesColor(result.input.colorIndex) }}
                />
                <span className="truncate text-xs font-semibold">
                  {result.input.name}
                </span>
              </div>

              {hasFree ? (
                <dl className="px-3 py-2 text-xs">
                  <div className="flex justify-between gap-2 py-1">
                    <dt className="text-ink-muted">무상 제공</dt>
                    <dd className="tabular-nums">
                      {formatCount(result.input.freeConsumables, "회")}
                      <span className="text-ink-muted">
                        {" · "}
                        {formatMonths(result.freeConsumableMonths)}분
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2 py-1">
                    <dt className="text-ink-muted">총 수입</dt>
                    <dd className="tabular-nums">
                      {formatMoney(result.freeConsumableRevenue)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2 py-1">
                    <dt className="text-ink-muted">총 비용 (장비 도입가)</dt>
                    <dd className="tabular-nums">
                      {formatMoney(result.input.price)}
                    </dd>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2 rounded bg-plane px-2 py-1.5">
                    <dt className="font-semibold">순 이익</dt>
                    <dd className="text-base font-semibold tabular-nums">
                      {formatMoney(result.freeConsumableProfit)}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="px-3 py-4 text-xs text-ink-muted">무상 제공 없음</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
