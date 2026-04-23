import { type ChangeEvent } from "react";
import type { CoreType, InputParameters } from "../types";
import { CSA_VALUES } from "../data/cableTables";

interface Props {
  value: InputParameters;
  onChange: (next: InputParameters) => void;
  onCalculate: () => void;
  onClear: () => void;
}

const CORE_TYPES: CoreType[] = ["Single Core", "2 Core", "3 or 4 Core"];

function Field({
  label,
  unit,
  children,
}: {
  label: string;
  unit?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted uppercase tracking-wide">
        {label}
        {unit ? <span className="ml-1 text-slate-400">({unit})</span> : null}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

export default function InputForm({
  value,
  onChange,
  onCalculate,
  onClear,
}: Props) {
  const update = <K extends keyof InputParameters>(
    key: K,
    v: InputParameters[K],
  ) => onChange({ ...value, [key]: v });

  const num = (e: ChangeEvent<HTMLInputElement>) =>
    e.target.value === "" ? 0 : Number(e.target.value);

  return (
    <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">Input parameters</h2>
        <span className="text-xs text-muted">All fields required</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Load current" unit="A">
          <input
            type="number"
            min={0}
            step="any"
            value={value.load_Amp}
            onChange={(e) => update("load_Amp", num(e))}
            className={inputClass}
          />
        </Field>

        <Field label="Cable run length" unit="m">
          <input
            type="number"
            min={0}
            step="any"
            value={value.run_Length}
            onChange={(e) => update("run_Length", num(e))}
            className={inputClass}
          />
        </Field>

        <Field label="System voltage" unit="V">
          <input
            type="number"
            min={0}
            step="any"
            value={value.voltage}
            onChange={(e) => update("voltage", num(e))}
            className={inputClass}
          />
        </Field>

        <Field label="Max voltage drop" unit="%">
          <input
            type="number"
            min={0}
            step="any"
            value={value.voltage_Drop}
            onChange={(e) => update("voltage_Drop", num(e))}
            className={inputClass}
          />
        </Field>

        <Field label="Power factor">
          <input
            type="number"
            min={0}
            max={1}
            step="0.01"
            value={value.pf}
            onChange={(e) => update("pf", num(e))}
            className={inputClass}
          />
        </Field>

        <Field label="Ambient temperature" unit="°C">
          <input
            type="number"
            step="any"
            value={value.ambient_Temp}
            onChange={(e) => update("ambient_Temp", num(e))}
            className={inputClass}
          />
        </Field>

        <Field label="Core type">
          <select
            value={value.core_Type}
            onChange={(e) => update("core_Type", e.target.value as CoreType)}
            className={inputClass}
          >
            {CORE_TYPES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>

        <Field label="Cable CSA">
          <select
            value={value.selected_CSA}
            onChange={(e) => update("selected_CSA", e.target.value)}
            className={inputClass}
          >
            <option value="Minimum Run">Minimum Run (auto)</option>
            {CSA_VALUES.map((v) => (
              <option key={v} value={v}>
                {v} mm²
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onCalculate}
          className="inline-flex items-center justify-center rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 active:scale-[0.99]"
        >
          Calculate
        </button>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center justify-center rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-canvas"
        >
          Reset
        </button>
      </div>
    </section>
  );
}
