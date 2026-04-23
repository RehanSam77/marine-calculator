interface Props {
  log: string[];
}

export default function CalculationLog({ log }: Props) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-ink">
        Calculation log
      </h2>
      <div className="thin-scroll max-h-72 overflow-auto rounded-lg bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-200">
        {log.length === 0 ? (
          <div className="text-slate-500">No calculation run yet.</div>
        ) : (
          log.map((line, i) => (
            <div
              key={i}
              className={
                line.startsWith("✓")
                  ? "text-emerald-300"
                  : line.startsWith("⚠")
                    ? "text-amber-300"
                    : line.startsWith("❌")
                      ? "text-rose-300"
                      : line.startsWith("Iteration") ||
                          line.startsWith("Runs:")
                        ? "text-sky-300"
                        : "text-slate-200"
              }
            >
              {line || "\u00A0"}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
