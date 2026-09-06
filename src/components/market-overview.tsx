import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts"
import type { Artist, TimeRange } from "@/data/artists"
import { getChange } from "@/lib/trend-score"
import { MetricRow } from "@/components/metric-row"
import { cn } from "@/lib/utils"

type MarketOverviewProps = { artist: Artist; range: TimeRange }

export function MarketOverview({ artist, range }: MarketOverviewProps) {
  const change = getChange(artist, range)
  const roundedChange = change === null ? null : Math.round(change)
  const confidenceLabel = artist.confidence >= 75 ? "high confidence" : artist.confidence >= 45 ? "medium confidence" : "low confidence"
  const confidenceColor = artist.confidence >= 75 ? "border-primary/30 bg-primary/[0.06] text-primary" : artist.confidence >= 45 ? "border-amber-400/40 bg-amber-400/[0.06] text-amber-400" : "border-destructive/50 bg-destructive/[0.06] text-destructive"
  const snapshots = artist.dailySnapshots ?? []
  const lastDate = snapshots.at(-1)?.date
  const cutoff = lastDate ? Date.parse(lastDate + "T00:00:00Z") - (range === "24h" ? 1 : parseInt(range)) * 86_400_000 : 0
  const chartData = snapshots.filter((point) => Date.parse(point.date + "T00:00:00Z") >= cutoff)
    .map((point) => ({ date: point.date, value: Number((point.pulse / 10).toFixed(1)) }))
  const dateIndexes = [...new Set([0, ...(range === "24h" ? [] : [Math.floor((chartData.length - 1) / 2)]), chartData.length - 1])]
    .filter((index) => index >= 0 && index < chartData.length)
  const formatDate = (date: string) => new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", timeZone: "UTC",
  }).format(new Date(date + "T00:00:00Z")).toLowerCase()

  return <section>
    <div className="mb-3"><p className="font-heading text-[10px] tracking-[0.16em] text-primary">selected market</p><h2 className="mt-1 text-sm font-medium">market overview</h2></div>
    <div className="border border-border p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium">{artist.name} <span className="text-muted-foreground">type beat</span></p><div className="mt-2 flex flex-wrap gap-1.5"><p className="inline-flex border border-primary/30 bg-primary/[0.06] px-2 py-1 font-heading text-[9px] tracking-wide text-primary">{artist.hasData ? artist.status : "collecting data"}</p>{artist.hasData && <p className={cn("inline-flex border px-2 py-1 font-heading text-[9px] tracking-wide", confidenceColor)}>{confidenceLabel}{artist.sampleSize !== undefined ? ` · ${artist.sampleSize} videos` : ""}</p>}</div><p className="mt-2 font-heading text-[9px] tracking-wide text-muted-foreground">{artist.hasData ? artist.reason : "history starts after the first daily refresh"}</p></div><div className="text-right"><p key={artist.score} className="value-pop font-heading text-3xl tracking-[-0.08em]">{artist.hasData ? (artist.score / 10).toFixed(1) : "—"}</p><p className={cn("mt-1 font-heading text-[11px] tabular-nums", roundedChange !== null && roundedChange > 0 ? "text-primary" : roundedChange !== null && roundedChange < 0 ? "text-destructive" : "text-muted-foreground")}>{roundedChange === null ? "—" : `${roundedChange > 0 ? "+" : ""}${roundedChange}%`} / {range}</p></div></div>

      {chartData.length > 0 ? <>
      <div key={`${artist.id}-${range}`} className="chart-enter chart-static -mx-2 mt-8 h-44" aria-label={`${artist.name} trend graph`}>
        <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}><defs><linearGradient id="pulse-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.22} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs><YAxis hide domain={["dataMin - 8", "dataMax + 8"]} /><Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} fill="url(#pulse-fill)" dot={chartData.length === 1 ? { r: 3, fill: "var(--primary)" } : false} activeDot={false} isAnimationActive animationDuration={700} /></AreaChart></ResponsiveContainer>
      </div>
      <div className="flex justify-between font-heading text-[9px] text-muted-foreground">
        {dateIndexes.map((index) => <span key={chartData[index].date}>{formatDate(chartData[index].date)}</span>)}
      </div>
      </> : <div className="flex h-44 items-center justify-center font-heading text-[10px] text-muted-foreground">{artist.hasData ? "history unavailable" : "collecting data"}</div>}
      {artist.hasData && <div className="mt-4 border-t border-border"><MetricRow label="demand score" value={artist.demand} description="Viewer activity in sampled type beat videos, ranked against tracked artists." /><MetricRow label="competition score" value={artist.competition} description="How crowded this market is with recent type beat uploads." /><MetricRow label="opportunity score" value={artist.opportunity} description="The balance of demand, growth, and competition in this market." active /></div>}
    </div>
  </section>
}
