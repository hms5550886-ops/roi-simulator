// ROI 시뮬레이터의 계산을 담당하는 순수 함수 모음.
// 동일한 입력에는 항상 동일한 결과를 반환한다 (PRD must-1 규칙: 계산결과 오차 0%).

/** 분석 기간(개월). 모든 장비를 동일한 기간으로 비교한다. */
export const ANALYSIS_MONTHS = 24;

/** 한 화면에서 비교할 수 있는 최대 장비 수. */
export const MAX_EQUIPMENT = 4;

/**
 * 장비 한 대의 도입 조건.
 * 금액 단위는 모두 '만원'으로 통일한다 (현장에서 부르는 단위와 맞추기 위함).
 */
export type EquipmentInput = {
  id: string;
  /** 장비명 */
  name: string;
  /** 장비마다 고정되는 색상 슬롯. 다른 장비를 지워도 남은 장비의 색이 바뀌지 않게 한다. */
  colorIndex: number;
  /** 장비 도입가 (만원) */
  price: number;
  /** 1회 시술가 (만원) */
  treatmentPrice: number;
  /** 월 시술 건수 (회) */
  monthlyCases: number;
  /** 시술 1회당 소모품 단가 (만원) */
  consumableCost: number;
  /** 소모품 무상 제공 수량 (회) */
  freeConsumables: number;
  /** 월 고정비 — 유지보수·임대 등 (만원) */
  monthlyFixedCost: number;
};

/** 월별 시뮬레이션 한 점. */
export type MonthlyPoint = {
  /** 경과 개월 (0 = 도입 시점) */
  month: number;
  /** 해당 월의 순이익 (만원) */
  profit: number;
  /** 장비 도입가를 차감한 누적 손익 (만원) */
  cumulativeNet: number;
};

/** 장비 한 대의 시뮬레이션 결과. */
export type RoiResult = {
  input: EquipmentInput;
  /** 0개월 ~ ANALYSIS_MONTHS 까지의 월별 추이 */
  monthly: MonthlyPoint[];
  /** 월 매출 (만원) */
  monthlyRevenue: number;
  /** 무상 소모품을 모두 소진한 뒤의 월 순이익 (만원) */
  steadyMonthlyProfit: number;
  /** 투자 회수기간(개월). 분석 기간 안에 회수하지 못하면 null */
  paybackMonths: number | null;
  /** 분석 기간의 최종 누적 손익 (만원) */
  netAfterPeriod: number;
  /** 분석 기간 기준 ROI(%). 도입가가 0이면 null */
  roiPercent: number | null;
  /** 무상 제공 소모품을 모두 소진하는 데 걸리는 개월. 월 시술 건수가 0이면 null */
  freeConsumableMonths: number | null;
  /** 무상 제공 소모품만으로 올리는 총 수입 (만원) */
  freeConsumableRevenue: number;
  /** 위 수입에서 장비 도입가를 뺀 순이익 (만원) */
  freeConsumableProfit: number;
  /** 분석 기간 안에 장비 도입가와 고정비를 모두 회수하는 데 필요한 월 시술 건수. 불가능하면 null */
  breakEvenCases: number | null;
  /** 건수 가정을 흔들었을 때의 회수기간. 상담에서 "생각보다 안 오면?"에 답하기 위한 값 */
  scenarios: {
    conservative: ScenarioPoint;
    aggressive: ScenarioPoint;
  };
};

/** 건수 가정을 바꿨을 때의 결과 한 점. */
export type ScenarioPoint = {
  monthlyCases: number;
  paybackMonths: number | null;
};

/** 보수/공격 시나리오에서 월 시술 건수를 흔드는 폭. */
export const SCENARIO_SWING = 0.3;

/** 음수·NaN 입력이 계산을 오염시키지 않도록 0 이상의 유한한 수로 정리한다. */
function sanitize(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/**
 * 분석 기간 안에 장비 도입가와 고정비를 모두 회수하는 데 필요한 월 시술 건수.
 * 시술 1건의 남는 돈이 0 이하라 아무리 해도 회수가 안 되면 null.
 */
function calcBreakEvenCases(
  price: number,
  treatmentPrice: number,
  consumableCost: number,
  freeConsumables: number,
  monthlyFixedCost: number,
): number | null {
  if (treatmentPrice <= 0) {
    return null;
  }
  const target = price + ANALYSIS_MONTHS * monthlyFixedCost;

  // 분석 기간 내내 무상 제공분만 쓰는 경우 (소모품비 0)
  const casesWithFreeOnly = target / (ANALYSIS_MONTHS * treatmentPrice);
  if (casesWithFreeOnly * ANALYSIS_MONTHS <= freeConsumables) {
    return Math.ceil(casesWithFreeOnly);
  }

  const marginPerCase = treatmentPrice - consumableCost;
  if (marginPerCase <= 0) {
    return null;
  }
  const cases =
    (target - freeConsumables * consumableCost) / (ANALYSIS_MONTHS * marginPerCase);
  return Math.max(0, Math.ceil(cases));
}

/**
 * 장비 한 대의 월별 손익을 시뮬레이션한다.
 * 소모품은 무상 제공분을 먼저 소진한 뒤부터 비용으로 잡는다.
 */
function simulateCore(input: EquipmentInput): Omit<RoiResult, "scenarios"> {
  const price = sanitize(input.price);
  const treatmentPrice = sanitize(input.treatmentPrice);
  const monthlyCases = sanitize(input.monthlyCases);
  const consumableCost = sanitize(input.consumableCost);
  const monthlyFixedCost = sanitize(input.monthlyFixedCost);

  const freeConsumables = sanitize(input.freeConsumables);

  const monthlyRevenue = treatmentPrice * monthlyCases;
  const steadyMonthlyProfit =
    monthlyRevenue - monthlyCases * consumableCost - monthlyFixedCost;

  // 무상 제공 소모품만 사용했을 때의 손익. 소모품 비용이 들지 않으므로 비용은 장비 도입가뿐이다.
  const freeConsumableRevenue = freeConsumables * treatmentPrice;

  let freeLeft = freeConsumables;
  let cumulativeProfit = 0;
  // 도입 시점에는 장비 도입가만큼 마이너스에서 출발한다.
  const monthly: MonthlyPoint[] = [
    { month: 0, profit: 0, cumulativeNet: -price },
  ];
  // 도입가가 0이면 시작부터 손익분기 상태다.
  let paybackMonths: number | null = price === 0 ? 0 : null;

  for (let month = 1; month <= ANALYSIS_MONTHS; month += 1) {
    const paidCases = Math.max(0, monthlyCases - freeLeft);
    freeLeft = Math.max(0, freeLeft - monthlyCases);

    const profit = monthlyRevenue - paidCases * consumableCost - monthlyFixedCost;
    const previousNet = cumulativeProfit - price;
    cumulativeProfit += profit;
    const cumulativeNet = cumulativeProfit - price;

    if (paybackMonths === null && previousNet < 0 && cumulativeNet >= 0) {
      // 손익분기를 넘긴 시점을 해당 월 안에서 선형 보간한다.
      paybackMonths = month - 1 + (profit > 0 ? -previousNet / profit : 0);
    }

    monthly.push({ month, profit, cumulativeNet });
  }

  const netAfterPeriod = cumulativeProfit - price;

  return {
    input,
    monthly,
    monthlyRevenue,
    steadyMonthlyProfit,
    paybackMonths,
    netAfterPeriod,
    roiPercent: price > 0 ? (netAfterPeriod / price) * 100 : null,
    freeConsumableMonths: monthlyCases > 0 ? freeConsumables / monthlyCases : null,
    freeConsumableRevenue,
    freeConsumableProfit: freeConsumableRevenue - price,
    breakEvenCases: calcBreakEvenCases(
      price,
      treatmentPrice,
      consumableCost,
      freeConsumables,
      monthlyFixedCost,
    ),
  };
}

/** 기본 결과에 건수 가정을 흔든 시나리오를 덧붙인다. */
export function simulate(input: EquipmentInput): RoiResult {
  const scenarioAt = (ratio: number): ScenarioPoint => {
    const monthlyCases = Math.round(sanitize(input.monthlyCases) * ratio);
    return {
      monthlyCases,
      paybackMonths: simulateCore({ ...input, monthlyCases }).paybackMonths,
    };
  };

  return {
    ...simulateCore(input),
    scenarios: {
      conservative: scenarioAt(1 - SCENARIO_SWING),
      aggressive: scenarioAt(1 + SCENARIO_SWING),
    },
  };
}

/** 여러 장비를 한 번에 시뮬레이션한다. */
export function simulateAll(inputs: EquipmentInput[]): RoiResult[] {
  return inputs.map(simulate);
}
