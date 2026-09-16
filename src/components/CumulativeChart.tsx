"use client";

import { useState, type MouseEvent } from "react";
import { niceTicks, seriesColor } from "@/lib/chart";
import { formatMoney, formatMoneyShort, formatMonths } from "@/lib/format";
import { ANALYSIS_MONTHS, type RoiResult } from "@/lib/roi";

const VIEW_WIDTH = 720;
// 전체 폭을 쓰므로 가로로 넓고 낮은 비율로 둔다.
const VIEW_HEIGHT = 195;
const PAD = { left: 58, right: 24, top: 16, bottom: 32 };
const PLOT_WIDTH = VIEW_WIDTH - PAD.left - PAD.right;
const PLOT_HEIGHT = VIEW_HEIGHT - PAD.top - PAD.bottom;
/** 분석 기간을 6등분한 눈금 (36개월이면 6개월 단위, 24개월이면 4개월 단위). */
const X_TICKS = Array.from({ length: 7 }, (_, i) =>
  Math.round((ANALYSIS_MONTHS / 6) * i),
);

type Props = {
  results: RoiResult[];
};

/**
 * 누적 손익 추이 꺾은선 그래프.
 * 선이 0원 선(손익분기)을 넘어가는 지점이 곧 투자 회수 시점이다.
 */
export default function CumulativeChart({ results }: Props) {
  const [hoverMonth, setHoverMonth] = useState<number | null>(null);

  const values = results.flatMap((result) =>
    result.monthly.map((point) => point.cumulativeNet),
  );
  // 손익분기선이 항상 보이도록 0을 범위에 포함시킨다.
  const ticks = niceTicks(Math.min(0, ...values), Math.max(0, ...values), 5);
  const yMin = ticks[0];
  const yMax = ticks[ticks.length - 1];

  const xFor = (month: number) =>
    PAD.left + (month / ANALYSIS_MONTHS) * PLOT_WIDTH;
  const yFor = (value: number) =>
    PAD.top + (1 - (value - yMin) / (yMax - yMin || 1)) * PLOT_HEIGHT;

  const handleMove = (event: MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const month = Math.round(
      ((ratio * VIEW_WIDTH - PAD.left) / PLOT_WIDTH) * ANALYSIS_MONTHS,
    );
    setHoverMonth(Math.min(ANALYSIS_MONTHS, Math.max(0, month)));
  };

  return (
    <figure className="print-card rounded-lg border border-[var(--hairline)] bg-surface p-4">
      <figcaption className="mb-1 text-sm font-semibold">
        누적 손익 추이
      </figcaption>
      <p className="mb-3 text-xs text-ink-secondary">
        선이 손익분기선(0원)을 넘는 시점이 투자 회수 시점입니다. 가로축 개월 · 세로축
        만원
      </p>

      <div className="relative">
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          className="w-full"
          role="img"
          aria-label="장비별 누적 손익 추이 그래프"
          onMouseMove={handleMove}
          onMouseLeave={() => setHoverMonth(null)}
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={VIEW_WIDTH - PAD.right}
                y1={yFor(tick)}
                y2={yFor(tick)}
                className={tick === 0 ? "stroke-axis" : "stroke-grid"}
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={yFor(tick) + 4}
                textAnchor="end"
                className="fill-ink-muted text-[11px] tabular-nums"
              >
                {formatMoneyShort(tick)}
              </text>
            </g>
          ))}

          {X_TICKS.map((month) => (
            <text
              key={month}
              x={xFor(month)}
              y={VIEW_HEIGHT - 10}
              textAnchor="middle"
              className="fill-ink-muted text-[11px] tabular-nums"
            >
              {month}
            </text>
          ))}
          {hoverMonth !== null ? (
            <line
              x1={xFor(hoverMonth)}
              x2={xFor(hoverMonth)}
              y1={PAD.top}
              y2={PAD.top + PLOT_HEIGHT}
              className="stroke-axis"
              strokeWidth={1}
            />
          ) : null}

          {results.map((result) => {
            const color = seriesColor(result.input.colorIndex);
            const path = result.monthly
              .map(
                (point, index) =>
                  `${index === 0 ? "M" : "L"} ${xFor(point.month)} ${yFor(point.cumulativeNet)}`,
              )
              .join(" ");
            const last = result.monthly[result.monthly.length - 1];

            return (
              <g key={result.input.id}>
                <path
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* 손익분기를 넘는 지점에 표시를 찍어 회수 시점을 눈에 띄게 한다. */}
                {result.paybackMonths !== null ? (
                  <circle
                    cx={xFor(result.paybackMonths)}
                    cy={yFor(0)}
                    r={5}
                    fill={color}
                    className="stroke-surface"
                    strokeWidth={2}
                  />
                ) : null}
                <circle
                  cx={xFor(last.month)}
                  cy={yFor(last.cumulativeNet)}
                  r={4.5}
                  fill={color}
                  className="stroke-surface"
                  strokeWidth={2}
                />
                {hoverMonth !== null ? (
                  <circle
                    cx={xFor(hoverMonth)}
                    cy={yFor(result.monthly[hoverMonth].cumulativeNet)}
                    r={4.5}
                    fill={color}
                    className="stroke-surface"
                    strokeWidth={2}
                  />
                ) : null}
              </g>
            );
          })}
        </svg>

        {hoverMonth !== null ? (
          <div
            className="print-hidden pointer-events-none absolute top-2 z-10 w-44 rounded-md border border-[var(--hairline)] bg-surface p-2 text-xs shadow-sm"
            style={
              xFor(hoverMonth) / VIEW_WIDTH > 0.5
                ? { right: `${100 - (xFor(hoverMonth) / VIEW_WIDTH) * 100 + 2}%` }
                : { left: `${(xFor(hoverMonth) / VIEW_WIDTH) * 100 + 2}%` }
            }
          >
            <div className="mb-1 font-semibold">{hoverMonth}개월 시점</div>
            {results.map((result) => (
              <div
                key={result.input.id}
                className="flex items-center justify-between gap-2 py-0.5"
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <span
                    aria-hidden
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: seriesColor(result.input.colorIndex) }}
                  />
                  <span className="truncate text-ink-secondary">
                    {result.input.name}
                  </span>
                </span>
                <span className="shrink-0 tabular-nums">
                  {formatMoney(result.monthly[hoverMonth].cumulativeNet)}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs">
        {results.map((result) => (
          <li key={result.input.id} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="h-0.5 w-4 rounded-full"
              style={{ backgroundColor: seriesColor(result.input.colorIndex) }}
            />
            <span className="text-ink-secondary">{result.input.name}</span>
            <span className="tabular-nums">
              {formatMonths(result.paybackMonths)}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
