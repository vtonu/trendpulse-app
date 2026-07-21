import type { Artist, TimeRange } from "@/data/artists"

export const ranges: TimeRange[] = ["24h", "7d", "30d", "90d"]

export function calculateScore(artist: Artist) {
  const base = artist.demand * 0.4 + artist.momentum * 0.35 + (100 - artist.competition) * 0.25
  const personalBoost =
    (artist.isCredit ? 8 : 0) +
    (artist.isPriority ? 6 : 0) +
    (artist.genres.some((genre) => genre === "dark trap" || genre === "memphis") ? 4 : 0) +
    (artist.genres.includes("future type beat") ? 4 : 0)

  return Math.min(100, Math.round(base + personalBoost))
}

export function getChange(artist: Artist, range: TimeRange) {
  return artist[`change${range}` as keyof Artist] as number
}

export function getHistory(artist: Artist, range: TimeRange) {
  return artist[`history${range}` as keyof Artist] as number[]
}

export function rankArtists(data: Artist[], range: TimeRange) {
  const rangeWeight = { "24h": 0.18, "7d": 0.12, "30d": 0.08, "90d": 0.05 }[range]
  return data
    .map((artist) => ({ ...artist, score: calculateScore(artist) }))
    .sort((a, b) =>
      b.score + getChange(b, range) * rangeWeight - (a.score + getChange(a, range) * rangeWeight)
    )
}
