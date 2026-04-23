import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CalculationResult } from "../types";

interface Props {
  result: CalculationResult | null;
  voltageDropLimit: number;
  mode: "csa" | "runs";
}

export default function VoltageDropChart({
  result,
  voltageDropLimit,
  mode,
}: Props) {
  const data =
    result?.iterations.map((i) => ({
      x: mode === "csa" ? i.csa : i.iteration,
      vd: Number(i.voltage_drop.toFixed(3)),
    })) ?? [];

  return (
    <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">
          Voltage drop analysis
        </h2>
        <span className="text-xs text-muted">
          Limit: {voltageDropLimit}%
        </span>
      </div>
      <p className="mb-4 text-xs text-muted">
        {mode === "csa"
          ? "Voltage drop vs conductor cross-sectional area across iterations."
          : "Voltage drop vs number of parallel runs at the selected CSA."}
      </p>

      <div className="h-64 w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-line text-sm text-muted">
            Chart appears after calculation.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
            >
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis
                dataKey="x"
                type="number"
                domain={["dataMin", "dataMax"]}
                tick={{ fontSize: 11, fill: "#64748b" }}
                label={{
                  value: mode === "csa" ? "CSA (mm²)" : "Parallel runs",
                  position: "insideBottom",
                  offset: -2,
                  fontSize: 11,
                  fill: "#64748b",
                }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                label={{
                  value: "Vd (%)",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 11,
                  fill: "#64748b",
                }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                }}
                formatter={(v: number) => [`${v.toFixed(2)}%`, "Vd"]}
                labelFormatter={(l) =>
                  mode === "csa" ? `CSA: ${l} mm²` : `Runs: ${l}`
                }
              />
              <ReferenceLine
                y={voltageDropLimit}
                stroke="#ef4444"
                strokeDasharray="4 3"
                label={{
                  value: "Limit",
                  fill: "#ef4444",
                  fontSize: 10,
                  position: "right",
                }}
              />
              <Line
                type="monotone"
                dataKey="vd"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ r: 4, fill: "#0ea5e9" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
