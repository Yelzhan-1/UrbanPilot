type SectorRisk = {
    transport: number;
    ecology: number;
    safety: number;
    utilities: number;
  };
  
  type ScenarioComparisonProps = {
    beforeRisk: number; // 0-100
    afterRisk: number; // 0-100
    beforeSectors: SectorRisk;
    afterSectors: SectorRisk;
    className?: string;
  };
  
  type ComparisonRow = {
    label: string;
    before: number;
    after: number;
  };
  
  function clamp(value: number): number {
    return Math.max(0, Math.min(100, value));
  }
  
  function barColor(score: number): string {
    if (score >= 85) return "bg-rose-500";
    if (score >= 65) return "bg-orange-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-emerald-500";
  }
  
  function deltaColor(delta: number): string {
    if (delta > 0) return "text-rose-300";
    if (delta < 0) return "text-emerald-300";
    return "text-slate-300";
  }
  
  function deltaLabel(delta: number): string {
    if (delta > 0) return "Increase";
    if (delta < 0) return "Decrease";
    return "No change";
  }
  
  export default function ScenarioComparison({
    beforeRisk,
    afterRisk,
    beforeSectors,
    afterSectors,
    className = "",
  }: ScenarioComparisonProps) {
    const rows: ComparisonRow[] = [
      { label: "Overall City Risk", before: clamp(beforeRisk), after: clamp(afterRisk) },
      { label: "Transport", before: clamp(beforeSectors.transport), after: clamp(afterSectors.transport) },
      { label: "Ecology", before: clamp(beforeSectors.ecology), after: clamp(afterSectors.ecology) },
      { label: "Safety", before: clamp(beforeSectors.safety), after: clamp(afterSectors.safety) },
      { label: "Utilities", before: clamp(beforeSectors.utilities), after: clamp(afterSectors.utilities) },
    ];
  
    return (
      <section
        className={`rounded-2xl border border-white/10 bg-slate-950/60 p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur ${className}`}
      >
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Before / After</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-100">Scenario Comparison</h3>
          <p className="mt-1 text-sm text-slate-400">Quickly compare baseline vs projected outcomes across city systems.</p>
        </div>
  
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">Metric</th>
                <th className="px-3 py-2">Before</th>
                <th className="px-3 py-2">After</th>
                <th className="px-3 py-2">Delta</th>
                <th className="px-3 py-2">Visual</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const delta = row.after - row.before;
                return (
                  <tr key={row.label} className="rounded-xl bg-slate-900/70">
                    <td className="rounded-l-xl px-3 py-3 text-sm font-medium text-slate-100">{row.label}</td>
                    <td className="px-3 py-3 text-sm text-slate-200">{row.before}</td>
                    <td className="px-3 py-3 text-sm text-slate-200">{row.after}</td>
                    <td className={`px-3 py-3 text-sm font-semibold ${deltaColor(delta)}`}>
                      {delta > 0 ? "+" : ""}
                      {delta} ({deltaLabel(delta)})
                    </td>
                    <td className="rounded-r-xl px-3 py-3">
                      <div className="flex w-[180px] flex-col gap-2">
                        <div>
                          <div className="mb-1 flex justify-between text-[10px] text-slate-500">
                            <span>Before</span>
                            <span>{row.before}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-800">
                            <div className={`h-1.5 rounded-full ${barColor(row.before)}`} style={{ width: `${row.before}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="mb-1 flex justify-between text-[10px] text-slate-500">
                            <span>After</span>
                            <span>{row.after}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-800">
                            <div className={`h-1.5 rounded-full ${barColor(row.after)}`} style={{ width: `${row.after}%` }} />
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    );
  }