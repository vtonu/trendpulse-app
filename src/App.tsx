import { useMemo, useState } from "react"
import { MarketOverview } from "@/components/market-overview"
import { TimeRangeTabs } from "@/components/time-range-tabs"
import { TopTrendingList } from "@/components/top-trending-list"
import { TrendPulseHeader } from "@/components/trend-pulse-header"
import { artists as initialArtists, mockLastUpdated, type TimeRange } from "@/data/artists"
import { developmentRefresh, rankArtists } from "@/lib/trend-score"

export function App() {
  const [range, setRange] = useState<TimeRange>("24h")
  const [artists, setArtists] = useState(initialArtists)
  const rankedArtists = useMemo(() => rankArtists(artists, range), [artists, range])
  const [selectedId, setSelectedId] = useState(() => rankArtists(initialArtists, "24h")[0].id)
  const selectedArtist = rankedArtists.find((artist) => artist.id === selectedId) ?? rankedArtists[0]

  return (
    <main className="min-h-svh px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-10">
        <TrendPulseHeader lastUpdated={mockLastUpdated} />
        <TimeRangeTabs value={range} onChange={setRange} />
        <TopTrendingList artists={rankedArtists} range={range} selectedId={selectedArtist.id} onSelect={setSelectedId} />
        <MarketOverview artist={selectedArtist} range={range} />
        {import.meta.env.DEV && <button onClick={() => setArtists((current) => developmentRefresh(current))} className="self-start font-heading text-[9px] tracking-widest text-muted-foreground transition-colors hover:text-primary">refresh mock data ↗</button>}
      </div>
    </main>
  )
}

export default App
