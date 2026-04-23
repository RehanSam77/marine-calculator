import { useMemo, useRef, useState } from "react";
import { Cable, Github } from "lucide-react";
import InputForm from "./components/InputForm";
import Results from "./components/Results";
import VoltageDropChart from "./components/VoltageDropChart";
import CalculationLog from "./components/CalculationLog";
import { runCalculation } from "./lib/calculator";
import { generatePdfReport } from "./lib/pdf";
import type { CalculationResult, InputParameters } from "./types";

const DEFAULTS: InputParameters = {
  load_Amp: 150,
  run_Length: 80,
  voltage: 440,
  voltage_Drop: 3,
  pf: 0.85,
  core_Type: "3 or 4 Core",
  ambient_Temp: 45,
  selected_CSA: "Minimum Run",
};

export default function App() {
  const [params, setParams] = useState<InputParameters>(DEFAULTS);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const chartMode: "csa" | "runs" = useMemo(
    () => (params.selected_CSA === "Minimum Run" ? "csa" : "runs"),
    [params.selected_CSA],
  );

  const handleCalculate = () => {
    setError(null);
    try {
      if (params.pf <= 0 || params.pf > 1) {
        throw new Error("Power factor must be between 0 and 1.");
      }
      if (params.voltage <= 0) throw new Error("Voltage must be positive.");
      if (params.load_Amp <= 0)
        throw new Error("Load current must be positive.");
      const r = runCalculation(params);
      setResult(r);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Calculation failed";
      setError(msg);
      setResult(null);
    }
  };

  const handleClear = () => {
    setResult(null);
    setError(null);
    setParams(DEFAULTS);
  };

  const handleExportPdf = async () => {
    if (!result) return;

    // Try to rasterize the recharts SVG so it can be embedded in the PDF.
    let chartPng: string | null = null;
    try {
      const svg = chartRef.current?.querySelector("svg");
      if (svg) {
        chartPng = await svgToPng(svg);
      }
    } catch {
      chartPng = null;
    }

    await generatePdfReport(params, result, chartPng);
  };

  return (
    <div className="min-h-full">
      <header className="border-b border-line bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-white">
              <Cable size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold text-ink">
                Marine Cable Calculator
              </div>
              <div className="text-xs text-muted">
                Iterative CSA sizing · IEC 60287
              </div>
            </div>
          </div>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-canvas"
          >
            <Github size={14} />
            Source
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {error ? (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <InputForm
            value={params}
            onChange={setParams}
            onCalculate={handleCalculate}
            onClear={handleClear}
          />
          <Results result={result} onExportPdf={handleExportPdf} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div ref={chartRef}>
            <VoltageDropChart
              result={result}
              voltageDropLimit={params.voltage_Drop}
              mode={chartMode}
            />
          </div>
          <CalculationLog log={result?.log ?? []} />
        </div>

        <footer className="mt-12 border-t border-line pt-6 text-center text-xs text-muted">
          Built with React + TypeScript · Calculations mirror the reference
          Python implementation. Always verify against your engineering
          standards.
        </footer>
      </main>
    </div>
  );
}

/**
 * Convert an inline SVG element to a PNG data URL by rendering it onto a
 * canvas. Used to embed the Recharts chart in the generated PDF.
 */
function svgToPng(svg: SVGSVGElement): Promise<string> {
  return new Promise((resolve, reject) => {
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const svgBlob = new Blob(
      ['<?xml version="1.0" standalone="no"?>\r\n', source],
      { type: "image/svg+xml;charset=utf-8" },
    );
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const rect = svg.getBoundingClientRect();
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas 2D context unavailable"));
        return;
      }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}
