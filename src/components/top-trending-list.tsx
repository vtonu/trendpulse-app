import type { Artist, TimeRange } from "@/data/artists"
import { getChange } from "@/lib/trend-score"
import { TrendRow } from "@/components/trend-row"

type TopTrendingListProps = { artists: Artist[]; range: TimeRange; selectedId: string; onSelect: (id: string) => void }

export function TopTrendingList({ artists, range, selectedId, onSelect }: TopTrendingListProps) {
  return <section>
    <div className="mb-3 flex items-end justify-between"><div><p className="font-heading text-[10px] tracking-[0.16em] text-primary">market scan</p><h2 className="mt-1 text-sm font-medium">top trending</h2></div><span className="font-heading text-[10px] text-muted-foreground">score / 100</span></div>
    <div className="border border-border">{artists.slice(0, 10).map((artist, index) => <TrendRow key={artist.id} artist={artist} rank={index + 1} change={getChange(artist, range)} selected={artist.id === selectedId} onSelect={() => onSelect(artist.id)} />)}</div>
  </section>
}
