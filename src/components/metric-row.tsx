type MetricRowProps = { label: string; value: number; active?: boolean }

export function MetricRow({ label, value, active }: MetricRowProps) {
  return <div className="flex items-center justify-between border-b border-border py-3 last:border-b-0"><span className="text-xs text-muted-foreground">{label}</span><div className="flex items-center gap-3"><div className="h-px w-16 bg-border"><div className="h-px bg-primary transition-[width] duration-700" style={{ width: `${value}%` }} /></div><span key={value} className={`value-pop w-6 text-right font-heading text-xs tabular-nums ${active ? "text-primary" : ""}`}>{value}</span></div></div>
}
