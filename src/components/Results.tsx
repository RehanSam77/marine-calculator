import { FileDown } from "lucide-react";
import type { CalculationResult } from "../types";

interface Props {
  result: CalculationResult | null;
  onExportPdf: () => void;
}

function Stat({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-xl font-semibold text-ink tabular-nums">
          {value}
        </span>
        {unit ? <span className="text-sm text-muted">{unit}</span> : null}
      </div>
    </div>
  );
}

export default function Results({ result, onExportPdf }: Props) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">Results</h2>
        <button
          type="button"
          onClick={onExportPdf}
          disabled={!result}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FileDown size={14} />
          Export PDF
        </button>
      </div>

      {result ? (
        <>
          <div className="mb-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 p-5 text-white">
            <div className="text-xs uppercase tracking-wide text-slate-300">
              Selected cable
            </div>
            <div className="mt-1 text-2xl font-semibold">
              BVA-XXXN/1C{result.csa}
            </div>
            <div className="mt-1 text-sm text-slate-300">
              {result.num_runs > 1
                ? `${result.num_runs} parallel runs`
                : "Single run"}
              {"  •  "}
              {result.rated_Current} A rating
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="CSA" value={result.csa} unit="mm²" />
            <Stat
              label="Rated current"
              value={String(result.rated_Current)}
              unit="A"
            />
            <Stat
              label="Voltage drop"
              value={result.Vd_Percent.toFixed(2)}
              unit="%"
            />
            <Stat
              label="Conductor temp"
              value={result.newConTemp.toFixed(1)}
              unit="°C"
            />
            <Stat
              label="Resistance"
              value={result.R.toFixed(4)}
              unit="Ω/km"
            />
            <Stat
              label="Reactance"
              value={result.X.toFixed(4)}
              unit="Ω/km"
            />
          </div>
        </>
      ) : (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-line text-sm text-muted">
          Enter parameters and press Calculate to see results.
        </div>
      )}
    </section>
  );
}
