import { useEffect, useMemo, useRef, useState } from "react"
import { MarketOverview } from "@/components/market-overview"
import { TimeRangeTabs } from "@/components/time-range-tabs"
import { TopTrendingList } from "@/components/top-trending-list"
import { TrendPulseHeader } from "@/components/trend-pulse-header"
import {
  artists as initialArtists,
  type Artist,
  type TimeRange,
} from "@/data/artists"
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
    return date.toLowerCase()
  })
  const [lastUpdated, setLastUpdated] = useState(localTime)
  const rankedArtists = useMemo(
    () => rankArtists(artists, range),
    [artists, range]
  )
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const marketOverviewRef = useRef<HTMLDivElement>(null)
  const selectedArtist =
    (selectedId
      ? rankedArtists.find((artist) => artist.id === selectedId)
      : undefined) ?? rankedArtists[0]

  function handleRangeChange(nextRange: TimeRange) {
    setRange(nextRange)
    setSelectedId(null)
  }

  function handleArtistSelect(id: string) {
    setSelectedId(id)

    if (window.matchMedia("(max-width: 639px)").matches) {
      window.requestAnimationFrame(() => {
        marketOverviewRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      })
    }
  }

  useEffect(() => {
    const controller = new AbortController()

    async function loadTrendData() {
      try {
        const response = await fetch("/data/trends.json", {
          cache: "no-store",
          signal: controller.signal,
        })
        if (!response.ok) return

        const payload = (await response.json()) as {
          updatedAt?: string
          artists?: Array<Partial<Artist> & Pick<Artist, "id">>
        }
        if (!payload.artists?.length) return

        if (payload.updatedAt) {
          const updatedAt = new Date(payload.updatedAt)
          const date = new Intl.DateTimeFormat(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(updatedAt)
          setLastUpdated(date.toLowerCase())
        }

        setArtists((current) =>
          current.map((artist) => {
            const liveArtist = payload.artists?.find(
              (liveArtist) => liveArtist.id === artist.id
            )
            if (!liveArtist) return artist

            const sampleSize = liveArtist.sampleSize ?? artist.sampleSize
            const confidence = liveArtist.confidence ?? Math.round(
              Math.min(100, ((sampleSize ?? 0) / 60) * 100) * 0.7 + 15
            )
            const sustainedMomentum = liveArtist.sustainedMomentum ?? liveArtist.momentum ?? artist.sustainedMomentum
            const demand = liveArtist.demand ?? artist.demand
            const competition = liveArtist.competition ?? artist.competition
            const opportunity = liveArtist.confidence === undefined
              ? Math.round(demand * 0.35 + sustainedMomentum * 0.3 + (100 - competition) * 0.2 + confidence * 0.15)
              : liveArtist.opportunity ?? artist.opportunity
            const change24h = "change24h" in liveArtist ? liveArtist.change24h ?? null : artist.change24h
            const change7d = "change7d" in liveArtist ? liveArtist.change7d ?? null : artist.change7d
            const change30d = "change30d" in liveArtist ? liveArtist.change30d ?? null : artist.change30d
            const reason = liveArtist.reason ?? (
              confidence < 40 ? "limited data" :
              change30d !== null && change30d >= 25 ? "strong 30d growth" :
              change24h !== null && change24h >= 25 ? "24h spike" :
              change7d !== null && change7d >= 15 ? "strong 7d growth" :
              demand >= 70 ? "steady demand" :
              change30d !== null && change30d <= -20 ? "30d decline" :
              "mixed market signals"
            )

            return {
              ...artist,
              ...liveArtist,
              confidence,
              sustainedMomentum,
              opportunity,
              reason,
            }
          })
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
        <aside
          className="border border-border p-4 sm:p-5"
          aria-labelledby="how-it-works-title"
        >
          <p
            id="how-it-works-title"
            className="font-heading text-[10px] tracking-[0.16em] text-primary"
          >
            how it works:
          </p>
          <ol className="mt-3 space-y-2 text-xs leading-5 text-muted-foreground">
            <li>
              <span className="mr-2 font-heading text-foreground">1.</span>trend
              pulse checks youtube type beats data daily.
            </li>
            <li>
              <span className="mr-2 font-heading text-foreground">2.</span>
              choose 24h, 7d, or 30d tab to see market history.
            </li>
            <li>
              <span className="mr-2 font-heading text-foreground">3.</span>
              select an artist to compare demand, competition, and opportunity.
            </li>
          </ol>
          <div
            className="mt-3 flex items-center gap-2 border-t border-border pt-3"
            aria-label="opportunity levels"
          >
            <span className="font-heading text-[9px] tracking-wide text-muted-foreground">
              opportunity for type beats videos:
            </span>
            <span className="inline-flex border border-destructive/50 bg-destructive/[0.06] px-2 py-1 font-heading text-[9px] tracking-wide text-destructive">
              low
            </span>
            <span className="inline-flex border border-amber-400/40 bg-amber-400/[0.06] px-2 py-1 font-heading text-[9px] tracking-wide text-amber-400">
              medium
            </span>
            <span className="inline-flex border border-primary/30 bg-primary/[0.06] px-2 py-1 font-heading text-[9px] tracking-wide text-primary">
              high
            </span>
          </div>
        </aside>
        <TimeRangeTabs value={range} onChange={handleRangeChange} />
        <TopTrendingList
          artists={rankedArtists}
          range={range}
          selectedId={selectedArtist.id}
          onSelect={handleArtistSelect}
        />
        <div ref={marketOverviewRef} className="scroll-mt-4">
          <MarketOverview artist={selectedArtist} range={range} />
        </div>
        <footer className="grid grid-cols-1 items-center gap-x-6 gap-y-2 border-t border-border pt-4 text-center font-heading text-[9px] tracking-wide text-muted-foreground sm:grid-cols-3">
          <p className="sm:text-left">
            made for producers by{" "}
            <a
              className="text-foreground transition-colors hover:text-primary"
              href="https://www.instagram.com/prodqualitymusic"
              target="_blank"
              rel="noreferrer"
            >
              quality
            </a>
          </p>
          <a
            className="text-foreground transition-colors hover:text-primary"
            href="https://www.instagram.com/trendpulseapp"
            target="_blank"
            rel="noreferrer"
          ></a>
          <a
            className="text-foreground transition-colors hover:text-primary sm:text-right"
            href="https://buymeacoffee.com/prodbyquality"
            target="_blank"
            rel="noreferrer"
          >
            buy me a coffee
          </a>
        </footer>
      </div>
    </main>
  )
}

export default App
