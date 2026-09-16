// 상담 현장에서 입력 공수를 줄이기 위한 자사 장비 기본값.
// 금액 단위는 roi.ts와 같은 '만원'이다.

import type { EquipmentInput } from "./roi";

/** 프리셋이 채우는 값. id와 색상 슬롯은 기존 장비의 것을 유지한다. */
export type EquipmentPreset = Omit<EquipmentInput, "id" | "colorIndex">;

export const OWN_EQUIPMENT_PRESETS: EquipmentPreset[] = [
  {
    name: "Density Noir",
    price: 6500,
    treatmentPrice: 180,
    monthlyCases: 20,
    consumableCost: 77,
    freeConsumables: 100,
    monthlyFixedCost: 0,
  },
  {
    name: "POTENZA",
    price: 5000,
    treatmentPrice: 30,
    monthlyCases: 30,
    consumableCost: 3.3,
    freeConsumables: 130,
    monthlyFixedCost: 0,
  },
];
