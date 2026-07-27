type MetricRowProps = {
  label: string
  value: number
  description: string
  active?: boolean
}

function getLevel(value: number) {
  if (value >= 70) return "high"
  if (value >= 40) return "medium"
  return "low"
}

export function MetricRow({
  label,
  value,
  description,
  active,
}: MetricRowProps) {
  const level = getLevel(value)
  const isCompetition = label === "competition score"
  const tone =
    level === "medium"
      ? "amber"
      : (level === "high") !== isCompetition
        ? "green"
        : "red"
  const barColor =
    tone === "green"
      ? "bg-primary"
      : tone === "amber"
        ? "bg-amber-400"
        : "bg-destructive"
  const badgeColor =
    tone === "green"
      ? "border-primary/30 bg-primary/[0.06] text-primary"
      : tone === "amber"
        ? "border-amber-400/40 bg-amber-400/[0.06] text-amber-400"
        : "border-destructive/50 bg-destructive/[0.06] text-destructive"

  return (
    <div className="flex items-center justify-between border-b border-border py-3 last:border-b-0">
      <span
        className="metric-help relative text-xs text-muted-foreground"
        tabIndex={0}
      >
        {label}
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 w-52 border border-border bg-popover px-3 py-2 text-[10px] leading-relaxed text-popover-foreground opacity-0 shadow-sm transition-opacity"
        >
          {description}
        </span>
      </span>
      <div className="flex items-center gap-3">
        <div className="h-px w-16 bg-border">
          <div
            className={`h-px transition-[width] duration-700 ${barColor}`}
            style={{ width: `${value}%` }}
          />
        </div>
        <span
          key={`${value}-${level}`}
          className={`value-pop inline-flex min-w-12 justify-center border px-2 py-1 font-heading text-[9px] tracking-wide ${badgeColor} ${active ? "font-medium" : ""}`}
        >
          {level}
        </span>
      </div>
    </div>
  )
}
