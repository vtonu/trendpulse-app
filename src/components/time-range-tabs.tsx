import type { TimeRange } from "@/data/artists"
import { ranges } from "@/lib/trend-score"
import { cn } from "@/lib/utils"

type TimeRangeTabsProps = { value: TimeRange; onChange: (range: TimeRange) => void }

export function TimeRangeTabs({ value, onChange }: TimeRangeTabsProps) {
  return <div className="grid grid-cols-4 border border-border">{ranges.map((range) => <button key={range} onClick={() => onChange(range)} className={cn("h-10 border-r border-border font-heading text-[11px] text-muted-foreground transition-colors last:border-r-0 hover:text-foreground", value === range && "bg-primary/10 text-primary")}>{range}</button>)}</div>
}
