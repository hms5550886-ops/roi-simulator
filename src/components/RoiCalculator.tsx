"use client";

import { useMemo, useState } from "react";
import { signOut } from "@/app/login/actions";
import ComparisonHeadline from "@/components/ComparisonHeadline";
import ComparisonTable from "@/components/ComparisonTable";
import CumulativeChart from "@/components/CumulativeChart";
import EquipmentForm from "@/components/EquipmentForm";
import FreeConsumableCards from "@/components/FreeConsumableCards";
import SummaryCards from "@/components/SummaryCards";
import { nextColorIndex } from "@/lib/chart";
import { OWN_EQUIPMENT_PRESETS } from "@/lib/presets";
import {
  ANALYSIS_MONTHS,
  MAX_EQUIPMENT,
  SCENARIO_SWING,
  simulateAll,
  type EquipmentInput,
} from "@/lib/roi";

/** 상담을 바로 시작할 수 있도록 자사 장비는 프리셋으로, 타사는 빈 칸에 가깝게 넣어둔다. */
const DEFAULT_EQUIPMENT: EquipmentInput[] = [
  { id: "eq-1", colorIndex: 0, ...OWN_EQUIPMENT_PRESETS[0] },
  {
    id: "eq-2",
    name: "타사 장비",
    colorIndex: 1,
    price: 9000,
    treatmentPrice: 25,
    monthlyCases: 35,
    consumableCost: 7,
    freeConsumables: 0,
    monthlyFixedCost: 40,
  },
];

type Props = {
  userEmail: string;
};

export default function RoiCalculator({ userEmail }: Props) {
  const [equipmentList, setEquipmentList] =
    useState<EquipmentInput[]>(DEFAULT_EQUIPMENT);

  // 입력이 바뀔 때만 다시 계산한다 (순수 계산이라 같은 입력이면 결과도 같다).
  const results = useMemo(() => simulateAll(equipmentList), [equipmentList]);

  const updateEquipment = (next: EquipmentInput) => {
    setEquipmentList((list) =>
      list.map((item) => (item.id === next.id ? next : item)),
    );
  };

  const addEquipment = () => {
    setEquipmentList((list) => {
      if (list.length >= MAX_EQUIPMENT) {
        return list;
      }
      const colorIndex = nextColorIndex(list.map((item) => item.colorIndex));
      return [
        ...list,
        {
          id: `eq-${Date.now()}`,
          name: `비교 장비 ${list.length + 1}`,
          colorIndex,
          price: 10000,
          treatmentPrice: 25,
          monthlyCases: 30,
          consumableCost: 5,
          freeConsumables: 0,
          monthlyFixedCost: 40,
        },
      ];
    });
  };

  const removeEquipment = (id: string) => {
    setEquipmentList((list) => list.filter((item) => item.id !== id));
  };

  return (
    <div className="print-page mx-auto w-full max-w-5xl px-6 py-8">
      <div className="print-hidden mb-2 flex items-center justify-end gap-2 text-xs text-ink-muted">
        <span>{userEmail}</span>
        <span>·</span>
        <form action={signOut}>
          <button type="submit" className="hover:text-ink hover:underline">
            로그아웃
          </button>
        </form>
      </div>

      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">장비 도입 수익성 분석</h1>
          <p className="mt-1 text-xs text-ink-secondary">
            분석 기간 {ANALYSIS_MONTHS}개월 · 금액 단위 만원 · 소모품은 무상 제공분을
            먼저 소진한 뒤부터 비용으로 반영합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="print-hidden shrink-0 rounded-md border border-[var(--hairline)] bg-surface px-3 py-1.5 text-sm hover:bg-plane"
        >
          A4로 인쇄
        </button>
      </header>

      {/*
        현장에서는 조건을 입력하며 시작하기보다, 미리 채워진 결과 화면을 먼저
        보여주고 설명하는 흐름이라 결과 섹션을 입력 폼보다 위에 둔다.
      */}
      <section className="grid gap-4">
        <ComparisonHeadline results={results} />
        <SummaryCards results={results} />
        <FreeConsumableCards results={results} />
        <CumulativeChart results={results} />
        <ComparisonTable results={results} />
      </section>

      <section className="print-hidden mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">도입 조건 입력</h2>
          <button
            type="button"
            onClick={addEquipment}
            disabled={equipmentList.length >= MAX_EQUIPMENT}
            className="rounded-md border border-[var(--hairline)] bg-surface px-3 py-1.5 text-xs hover:bg-plane disabled:cursor-not-allowed disabled:text-ink-muted"
          >
            비교 장비 추가 ({equipmentList.length}/{MAX_EQUIPMENT})
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {equipmentList.map((equipment) => (
            <EquipmentForm
              key={equipment.id}
              equipment={equipment}
              canRemove={equipmentList.length > 1}
              onChange={updateEquipment}
              onRemove={() => removeEquipment(equipment.id)}
            />
          ))}
        </div>
      </section>

      <p className="mt-4 text-[11px] text-ink-muted">
        보수·공격 시나리오는 월 시술 건수를 ±{Math.round(SCENARIO_SWING * 100)}%
        적용한 결과입니다. 손익분기 건수는 {ANALYSIS_MONTHS}개월 안에 장비 도입가와
        고정비를 모두 회수하는 데 필요한 월 시술 건수입니다. 본 자료는 입력한 가정에
        따른 추정치이며 실제 수익을 보장하지 않습니다.
      </p>
    </div>
  );
}
