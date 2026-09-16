// 차트가 공통으로 쓰는 색상 슬롯과 눈금 계산.

/**
 * 장비 구분용 색상 슬롯.
 * 색맹 판별 검증(CVD ΔE 9.1 / 일반시야 ΔE 22.9)을 통과한 순서이므로 임의로 바꾸지 않는다.
 */
export const SERIES_COLORS = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100"];

/** 장비의 색상 슬롯 번호로 실제 색을 얻는다. */
export function seriesColor(colorIndex: number): string {
  return SERIES_COLORS[colorIndex % SERIES_COLORS.length];
}

/** 이미 사용 중인 슬롯을 피해 비어 있는 가장 앞 슬롯을 고른다. */
export function nextColorIndex(usedIndexes: number[]): number {
  for (let index = 0; index < SERIES_COLORS.length; index += 1) {
    if (!usedIndexes.includes(index)) {
      return index;
    }
  }
  return usedIndexes.length % SERIES_COLORS.length;
}

/**
 * 축에 쓸 깔끔한 눈금 값을 만든다 (0 / 5,000 / 10,000 처럼 떨어지는 값).
 */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    return [min, min + 1];
  }

  const rawStep = (max - min) / Math.max(1, count - 1);
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / magnitude;
  const niceStep =
    (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * magnitude;

  const start = Math.floor(min / niceStep) * niceStep;
  const end = Math.ceil(max / niceStep) * niceStep;

  const ticks: number[] = [];
  for (let value = start; value <= end + niceStep / 2; value += niceStep) {
    // 부동소수점 누적 오차를 정리한다.
    ticks.push(Math.round(value * 1e6) / 1e6);
  }
  return ticks;
}
