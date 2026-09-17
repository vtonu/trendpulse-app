import type { Artist, TimeRange } from "@/data/artists"

export const ranges: TimeRange[] = ["3d", "14d", "30d"]
const DAY_MS = 86_400_000

export function calculateScore(artist: Artist) {
  if (!artist.hasData) return 0
  return artist.dailySnapshots?.at(-1)?.pulse ?? Math.round(
    artist.demand * 0.4 + artist.momentum * 0.35 + (100 - artist.competition) * 0.25
  )
}

export function getHistory(artist: Artist, range: TimeRange) {
  if (!artist.hasData) return []
  const snapshots = artist.dailySnapshots ?? []
  const latest = snapshots.at(-1)
  if (!latest) return []
  const cutoff = Date.parse(latest.date + "T00:00:00Z") - parseInt(range) * DAY_MS
  return snapshots.filter((point) =>
    Date.parse(point.date + "T00:00:00Z") >= cutoff && point.confidence !== 0
  )
}

export function getChange(artist: Artist, range: TimeRange) {
  if (!artist.hasData) return null
  const latest = artist.dailySnapshots?.at(-1)
  if (!latest || latest.confidence === 0) return null
  const target = new Date(Date.parse(latest.date + "T00:00:00Z") - parseInt(range) * DAY_MS).toISOString().slice(0, 10)
  const baseline = artist.dailySnapshots?.find((point) => point.date === target)
  if (!baseline || baseline.confidence === 0 || baseline.pulse <= 0) return null
  return Math.round(((latest.pulse - baseline.pulse) / baseline.pulse) * 1000) / 10
}

export function rankArtists(data: Artist[], range: TimeRange) {
  return data
    .map((artist) => ({ ...artist, score: calculateScore(artist) }))
    .sort((a, b) =>
      Number(b.hasData) - Number(a.hasData) ||
      b.score - a.score ||
      (getChange(b, range) ?? 0) - (getChange(a, range) ?? 0)
    )
}
