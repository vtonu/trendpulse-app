type MetricRowProps = { label: string; value: number; description: string; active?: boolean }

export function MetricRow({ label, value, description, active }: MetricRowProps) {
  return <div className="flex items-center justify-between border-b border-border py-3 last:border-b-0"><span className="metric-help relative text-xs text-muted-foreground" tabIndex={0}>{label}<span role="tooltip" className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 w-52 border border-border bg-popover px-3 py-2 text-[10px] leading-relaxed text-popover-foreground opacity-0 shadow-sm transition-opacity">{description}</span></span><div className="flex items-center gap-3"><div className="h-px w-16 bg-border"><div className="h-px bg-primary transition-[width] duration-700" style={{ width: `${value}%` }} /></div><span key={value} className={`value-pop w-6 text-right font-heading text-xs tabular-nums ${active ? "text-primary" : ""}`}>{value}</span></div></div>
}
