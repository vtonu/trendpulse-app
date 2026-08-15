import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts"
import type { Artist, TimeRange } from "@/data/artists"
import { getChange, getHistory } from "@/lib/trend-score"
import { MetricRow } from "@/components/metric-row"
import { cn } from "@/lib/utils"

type MarketOverviewProps = { artist: Artist; range: TimeRange }

export function MarketOverview({ artist, range }: MarketOverviewProps) {
  const change = getChange(artist, range)
  const roundedChange = Math.round(change)
  const hasLowData = artist.sampleSize !== undefined && artist.sampleSize < 10
  const chartData = getHistory(artist, range).map((value, index) => ({ index, value: Number((value / 10).toFixed(1)) }))
  return <section>
    <div className="mb-3"><p className="font-heading text-[10px] tracking-[0.16em] text-primary">selected market</p><h2 className="mt-1 text-sm font-medium">market overview</h2></div>
    <div className="border border-border p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium">{artist.name} <span className="text-muted-foreground">type beat</span></p><div className="mt-2 flex flex-wrap gap-1.5"><p className="inline-flex border border-primary/30 bg-primary/[0.06] px-2 py-1 font-heading text-[9px] tracking-wide text-primary">{artist.status}</p>{hasLowData && <p className="inline-flex border border-destructive/50 bg-destructive/[0.06] px-2 py-1 font-heading text-[9px] tracking-wide text-destructive">low data · {artist.sampleSize} videos</p>}</div></div><div className="text-right"><p key={artist.score} className="value-pop font-heading text-3xl tracking-[-0.08em]">{(artist.score / 10).toFixed(1)}</p><p className={cn("mt-1 font-heading text-[11px] tabular-nums", roundedChange > 0 ? "text-primary" : roundedChange < 0 ? "text-destructive" : "text-muted-foreground")}>{roundedChange > 0 ? "+" : ""}{roundedChange}% / {range}</p></div></div>
      <div key={`${artist.id}-${range}`} className="chart-enter chart-static -mx-2 mt-8 h-44" aria-label={`${artist.name} trend graph`}>
        <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}><defs><linearGradient id="pulse-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.22} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs><YAxis hide domain={["dataMin - 8", "dataMax + 8"]} /><Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} fill="url(#pulse-fill)" dot={false} activeDot={false} isAnimationActive animationDuration={700} /></AreaChart></ResponsiveContainer>
      </div>
      <div className="mt-4 border-t border-border"><MetricRow label="demand score" value={artist.demand} description="How much current search and viewer interest this market has." /><MetricRow label="competition score" value={artist.competition} description="How crowded this market is with recent type beat uploads." /><MetricRow label="opportunity score" value={artist.opportunity} description="The balance of demand, growth, and competition in this market." active /></div>
    </div>
  </section>
}
