import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts"
import type { Artist, TimeRange } from "@/data/artists"
import { getChange, getHistory } from "@/lib/trend-score"
import { MetricRow } from "@/components/metric-row"
import { cn } from "@/lib/utils"

type MarketOverviewProps = { artist: Artist; range: TimeRange }

export function MarketOverview({ artist, range }: MarketOverviewProps) {
  const change = getChange(artist, range)
  const chartData = getHistory(artist, range).map((value, index) => ({ index, value }))
  return <section>
    <div className="mb-3"><p className="font-heading text-[10px] tracking-[0.16em] text-primary">selected market</p><h2 className="mt-1 text-sm font-medium">market overview</h2></div>
    <div className="border border-border p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium">{artist.name} <span className="text-muted-foreground">type beat</span></p><p className="mt-2 inline-flex border border-primary/30 bg-primary/[0.06] px-2 py-1 font-heading text-[9px] tracking-wide text-primary">{artist.status}</p></div><div className="text-right"><p key={artist.score} className="value-pop font-heading text-3xl tracking-[-0.08em]">{artist.score}</p><p className={cn("mt-1 font-heading text-[11px] tabular-nums", change > 0 ? "text-primary" : change < 0 ? "text-destructive" : "text-muted-foreground")}>{change > 0 ? "+" : ""}{change}% / {range}</p></div></div>
      <div key={`${artist.id}-${range}`} className="chart-enter -mx-2 mt-8 h-44" aria-label={`${artist.name} trend graph`}>
        <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}><defs><linearGradient id="pulse-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.22} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs><YAxis hide domain={["dataMin - 8", "dataMax + 8"]} /><Tooltip cursor={{ stroke: "var(--border)" }} contentStyle={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 0, fontFamily: "Geist Mono Variable", fontSize: 10 }} labelFormatter={() => "score"} formatter={(value) => [value, "pulse"]} /><Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} fill="url(#pulse-fill)" dot={false} activeDot={{ r: 3, fill: "var(--primary)", stroke: "var(--background)", strokeWidth: 2 }} isAnimationActive animationDuration={700} /></AreaChart></ResponsiveContainer>
      </div>
      <div className="mt-4 border-t border-border"><MetricRow label="demand score" value={artist.demand} /><MetricRow label="competition score" value={artist.competition} /><MetricRow label="opportunity score" value={artist.opportunity} active /></div>
      <div className="mt-5 flex flex-wrap gap-1.5">{[artist.location, `${artist.name} type beat`, artist.descriptor].map((tag) => <span key={tag} className="border border-border px-2 py-1 font-heading text-[9px] text-muted-foreground">{tag}</span>)}</div>
    </div>
  </section>
}
