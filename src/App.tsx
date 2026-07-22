import { useEffect, useMemo, useState } from "react"
import { MarketOverview } from "@/components/market-overview"
import { TimeRangeTabs } from "@/components/time-range-tabs"
import { TopTrendingList } from "@/components/top-trending-list"
import { TrendPulseHeader } from "@/components/trend-pulse-header"
import { artists as initialArtists, type Artist, type TimeRange } from "@/data/artists"
import { rankArtists } from "@/lib/trend-score"

export function App() {
  const [range, setRange] = useState<TimeRange>("24h")
  const [artists, setArtists] = useState(initialArtists)
  const [localTime] = useState(() => {
    const now = new Date()
    const date = new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(now)
    const time = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(now)
    return `${date} · ${time}`.toLowerCase()
  })
  const [lastUpdated, setLastUpdated] = useState(localTime)
  const rankedArtists = useMemo(() => rankArtists(artists, range), [artists, range])
  const [selectedId, setSelectedId] = useState(() => rankArtists(initialArtists, "24h")[0].id)
  const selectedArtist = rankedArtists.find((artist) => artist.id === selectedId) ?? rankedArtists[0]

  useEffect(() => {
    const controller = new AbortController()

    async function loadTrendData() {
      try {
        const response = await fetch("/data/trends.json", {
          cache: "no-store",
          signal: controller.signal,
        })
        if (!response.ok) return

        const payload = (await response.json()) as { updatedAt?: string; artists?: Array<Partial<Artist> & Pick<Artist, "id">> }
        if (!payload.artists?.length) return

        if (payload.updatedAt) {
          const updatedAt = new Date(payload.updatedAt)
          const date = new Intl.DateTimeFormat(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(updatedAt)
          const time = new Intl.DateTimeFormat(undefined, {
            hour: "numeric",
            minute: "2-digit",
          }).format(updatedAt)
          setLastUpdated(`${date} · ${time}`.toLowerCase())
        }

        setArtists((current) =>
          current.map((artist) => ({
            ...artist,
            ...payload.artists?.find((liveArtist) => liveArtist.id === artist.id),
          }))
        )
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.warn("trend data unavailable; using local fallback")
        }
      }
    }

    void loadTrendData()
    return () => controller.abort()
  }, [])

  return (
    <main className="min-h-svh px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-10">
        <TrendPulseHeader lastUpdated={lastUpdated} />
        <TimeRangeTabs value={range} onChange={setRange} />
        <TopTrendingList artists={rankedArtists} range={range} selectedId={selectedArtist.id} onSelect={setSelectedId} />
        <MarketOverview artist={selectedArtist} range={range} />
      </div>
    </main>
  )
}

export default App
