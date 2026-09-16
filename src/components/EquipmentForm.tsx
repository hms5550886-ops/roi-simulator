"use client";

import { useState } from "react";
import { seriesColor } from "@/lib/chart";
import { OWN_EQUIPMENT_PRESETS, type EquipmentPreset } from "@/lib/presets";
import type { EquipmentInput } from "@/lib/roi";

type NumberFieldProps = {
  label: string;
  unit: string;
  value: number;
  onChange: (value: number) => void;
  /** 이 값을 넘으면 단위를 착각한 게 아닌지 경고한다 (예: 만원 대신 원 단위 입력). */
  warnAbove?: number;
};

/**
 * 숫자 입력칸.
 * 입력 중 빈 칸 상태를 허용하기 위해 화면용 문자열을 따로 들고 있는다.
 */
function NumberField({ label, unit, value, onChange, warnAbove }: NumberFieldProps) {
  const [draft, setDraft] = useState(String(value));
  const [emitted, setEmitted] = useState(value);

  // 프리셋처럼 바깥에서 값이 바뀐 경우에만 표시를 맞춘다.
  // (직접 타이핑해 빈 칸이 된 상태는 그대로 두기 위해 내가 보낸 값과 비교한다.)
  if (value !== emitted) {
    setEmitted(value);
    setDraft(String(value));
  }

  const showWarning = warnAbove !== undefined && value > warnAbove;

  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-ink-secondary">
        {label} <span className="text-ink-muted">({unit})</span>
      </span>
      <input
        type="number"
        min={0}
        step="any"
        inputMode="decimal"
        value={draft}
        onChange={(event) => {
          const raw = event.target.value;
          setDraft(raw);
          const parsed = Number(raw);
          const next =
            raw !== "" && Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
          setEmitted(next);
          onChange(next);
        }}
        className={`w-full rounded-md border bg-surface px-2.5 py-1.5 text-sm tabular-nums outline-none focus:border-ink-muted ${
          showWarning ? "border-amber-500" : "border-[var(--hairline)]"
        }`}
      />
      {showWarning ? (
        <span className="text-[11px] text-amber-600">
          값이 큽니다. 단위({unit})가 맞는지 확인해 주세요.
        </span>
      ) : null}
    </label>
  );
}

type Props = {
  equipment: EquipmentInput;
  canRemove: boolean;
  onChange: (next: EquipmentInput) => void;
  onRemove: () => void;
};

export default function EquipmentForm({
  equipment,
  canRemove,
  onChange,
  onRemove,
}: Props) {
  const update = (patch: Partial<EquipmentInput>) => {
    onChange({ ...equipment, ...patch });
  };

  // 프리셋은 장비명과 조건만 바꾸고, id와 색상 슬롯은 그대로 둔다.
  const applyPreset = (preset: EquipmentPreset) => {
    onChange({ ...equipment, ...preset });
  };

  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <span
          aria-hidden
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: seriesColor(equipment.colorIndex) }}
        />
        <input
          type="text"
          value={equipment.name}
          onChange={(event) => update({ name: event.target.value })}
          aria-label="장비명"
          className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1 py-1 text-sm font-semibold outline-none hover:border-[var(--hairline)] focus:border-ink-muted"
        />
        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 rounded-md px-2 py-1 text-xs text-ink-muted hover:bg-plane hover:text-ink"
          >
            삭제
          </button>
        ) : null}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-ink-muted">자사 장비 불러오기</span>
        {OWN_EQUIPMENT_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => applyPreset(preset)}
            className="rounded-md border border-[var(--hairline)] px-2 py-1 text-xs hover:bg-plane"
          >
            {preset.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label="장비 도입가"
          unit="만원"
          value={equipment.price}
          onChange={(price) => update({ price })}
          warnAbove={100000}
        />
        <NumberField
          label="1회 시술가"
          unit="만원"
          value={equipment.treatmentPrice}
          onChange={(treatmentPrice) => update({ treatmentPrice })}
          warnAbove={1000}
        />
        <NumberField
          label="월 시술 건수"
          unit="회"
          value={equipment.monthlyCases}
          onChange={(monthlyCases) => update({ monthlyCases })}
          warnAbove={500}
        />
        <NumberField
          label="소모품 단가"
          unit="만원/회"
          value={equipment.consumableCost}
          onChange={(consumableCost) => update({ consumableCost })}
          warnAbove={500}
        />
        <NumberField
          label="소모품 무상 제공"
          unit="회"
          value={equipment.freeConsumables}
          onChange={(freeConsumables) => update({ freeConsumables })}
          warnAbove={2000}
        />
        <NumberField
          label="월 고정비"
          unit="만원"
          value={equipment.monthlyFixedCost}
          onChange={(monthlyFixedCost) => update({ monthlyFixedCost })}
          warnAbove={5000}
        />
      </div>
    </div>
  );
}
