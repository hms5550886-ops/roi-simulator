// 화면과 인쇄물에 숫자를 표시하기 위한 포맷 함수 모음.
// 서버/브라우저에서 결과가 달라지지 않도록 locale 기능 대신 직접 계산한다.

/**
 * 천 단위 쉼표를 넣는다.
 * 소모품 단가(예: 3.3만원)처럼 소수점이 있는 금액은 두 자리까지 살린다.
 */
function withComma(value: number): string {
  const sign = value < 0 ? "-" : "";
  // 부동소수점 누적 오차를 먼저 정리한다 (예: 30 × 3.3 = 99.00000000000001).
  const absolute = Math.round(Math.abs(value) * 100) / 100;
  const integerPart = Math.floor(absolute);
  const fraction = absolute - integerPart;
  const grouped = integerPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (fraction === 0) {
    return sign + grouped;
  }
  return sign + grouped + fraction.toFixed(2).slice(1).replace(/0+$/, "");
}

/** 소수점 자릿수를 고정하되 불필요한 0은 없앤다. */
function trim(value: number, digits: number): string {
  return Number(value.toFixed(digits)).toString();
}

/**
 * 만원 단위 금액을 읽기 쉬운 문자열로 바꾼다.
 * 원장에게 제시하는 금액이므로 반올림하지 않고 '1억 3,750만원'처럼 끝자리까지 보여준다.
 */
export function formatMoney(manwon: number): string {
  const rounded = Math.round(manwon);
  if (Math.abs(rounded) >= 10000) {
    const sign = rounded < 0 ? "-" : "";
    const absolute = Math.abs(rounded);
    const eok = Math.floor(absolute / 10000);
    const rest = absolute % 10000;
    return rest === 0
      ? `${sign}${withComma(eok)}억원`
      : `${sign}${withComma(eok)}억 ${withComma(rest)}만원`;
  }
  // 억 단위가 아닌 금액은 소모품 단가(3.3만원)처럼 소수점을 살려야 한다.
  return `${withComma(manwon)}만원`;
}

/** 축 눈금처럼 좁은 자리에 쓰는 짧은 금액 표기. */
export function formatMoneyShort(manwon: number): string {
  if (Math.abs(manwon) >= 10000) {
    return `${trim(manwon / 10000, 1)}억`;
  }
  return withComma(manwon);
}

/** 회수기간을 '12.4개월' 형태로 표시한다. */
export function formatMonths(months: number | null): string {
  if (months === null) {
    return "기간 내 미회수";
  }
  return `${trim(months, 1)}개월`;
}

/** ROI 등 백분율 표시. 소수점까지 보여줄 정밀도가 아니므로 정수로 끊는다. */
export function formatPercent(percent: number | null): string {
  if (percent === null) {
    return "-";
  }
  return `${withComma(Math.round(percent))}%`;
}

/** 건수 등 단위가 붙는 정수 표시. */
export function formatCount(count: number, unit: string): string {
  return `${withComma(Math.round(count))}${unit}`;
}
