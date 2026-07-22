export type TimeRange = "24h" | "7d" | "30d" | "90d"

export type Artist = {
  id: string
  name: string
  score: number
  change24h: number
  change7d: number
  change30d: number
  change90d: number
  demand: number
  competition: number
  momentum: number
  opportunity: number
  status: "strong opportunity" | "rising fast" | "saturated" | "stable" | "cooling down"
  genres: string[]
  location: string
  descriptor: string
  isCredit: boolean
  isPriority: boolean
  history24h: number[]
  history7d: number[]
  history30d: number[]
  history90d: number[]
  sampleSize?: number
}

const history = (start: number, points: number, drift: number, seed: number) =>
  Array.from({ length: points }, (_, index) =>
    Math.max(8, Math.min(100, Math.round((start + index * drift + Math.sin(index * 1.7 + seed) * 3) * 10) / 10))
  )

type ArtistSeed = Omit<Artist, "score" | "opportunity" | "location" | "descriptor" | "history24h" | "history7d" | "history30d" | "history90d">

const seeds: ArtistSeed[] = [
  { id: "future", name: "future", change24h: 12, change7d: 18, change30d: 27, change90d: 34, demand: 94, competition: 79, momentum: 86, status: "rising fast", genres: ["future type beat", "dark trap", "melodic dark"], isCredit: false, isPriority: true },
  { id: "skrilla", name: "skrilla", change24h: 24, change7d: 38, change30d: 62, change90d: 81, demand: 88, competition: 53, momentum: 96, status: "strong opportunity", genres: ["dark trap", "street trap", "aggressive"], isCredit: true, isPriority: true },
  { id: "dracbaby", name: "dracbaby", change24h: 9, change7d: 23, change30d: 46, change90d: 72, demand: 77, competition: 38, momentum: 89, status: "strong opportunity", genres: ["memphis", "street trap", "dark trap"], isCredit: true, isPriority: true },
  { id: "ync-traislime", name: "ync traislime", change24h: 16, change7d: 31, change30d: 55, change90d: 76, demand: 74, competition: 31, momentum: 91, status: "rising fast", genres: ["memphis", "aggressive", "street trap"], isCredit: false, isPriority: true },
  { id: "baby-walkdown", name: "baby walkdown", change24h: 11, change7d: 26, change30d: 41, change90d: 63, demand: 69, competition: 29, momentum: 84, status: "strong opportunity", genres: ["memphis", "street trap"], isCredit: false, isPriority: true },
  { id: "fully-auto", name: "fully auto", change24h: 7, change7d: 19, change30d: 36, change90d: 58, demand: 67, competition: 26, momentum: 81, status: "strong opportunity", genres: ["dark trap", "aggressive", "street trap"], isCredit: true, isPriority: false },
  { id: "rodslime", name: "rodslime", change24h: 13, change7d: 28, change30d: 49, change90d: 69, demand: 72, competition: 34, momentum: 87, status: "rising fast", genres: ["memphis", "dark trap"], isCredit: false, isPriority: true },
  { id: "mac-critter", name: "mac critter", change24h: -4, change7d: 8, change30d: 22, change90d: 39, demand: 81, competition: 57, momentum: 65, status: "stable", genres: ["memphis", "street trap", "aggressive"], isCredit: true, isPriority: true },
  { id: "doubleg-fatt", name: "doubleg fatt", change24h: 8, change7d: 21, change30d: 35, change90d: 51, demand: 76, competition: 44, momentum: 80, status: "strong opportunity", genres: ["memphis", "street trap"], isCredit: false, isPriority: true },
  { id: "baby-shiesty", name: "baby shiesty", change24h: 5, change7d: 13, change30d: 28, change90d: 44, demand: 65, competition: 28, momentum: 77, status: "stable", genres: ["memphis", "aggressive"], isCredit: false, isPriority: false },
  { id: "babystacxzz", name: "babystacxzz", change24h: 15, change7d: 29, change30d: 45, change90d: 67, demand: 68, competition: 25, momentum: 88, status: "strong opportunity", genres: ["dark trap", "rage", "aggressive"], isCredit: false, isPriority: true },
  { id: "veeze", name: "veeze", change24h: 2, change7d: 7, change30d: 16, change90d: 28, demand: 89, competition: 76, momentum: 62, status: "saturated", genres: ["sample trap", "melodic dark"], isCredit: false, isPriority: false },
  { id: "lucki", name: "lucki", change24h: -2, change7d: 4, change30d: 12, change90d: 21, demand: 91, competition: 83, momentum: 58, status: "saturated", genres: ["dark trap", "sample trap", "melodic dark"], isCredit: false, isPriority: false },
  { id: "ken-carson", name: "ken carson", change24h: 6, change7d: 11, change30d: 18, change90d: 30, demand: 93, competition: 88, momentum: 73, status: "saturated", genres: ["rage", "aggressive"], isCredit: false, isPriority: false },
  { id: "osamason", name: "osamason", change24h: 10, change7d: 20, change30d: 37, change90d: 61, demand: 82, competition: 63, momentum: 85, status: "rising fast", genres: ["rage", "dark trap", "aggressive"], isCredit: false, isPriority: true },
  { id: "che", name: "che", change24h: 4, change7d: 12, change30d: 24, change90d: 43, demand: 73, competition: 55, momentum: 74, status: "stable", genres: ["rage", "sample trap"], isCredit: false, isPriority: false },
  { id: "nettspend", name: "nettspend", change24h: -6, change7d: -2, change30d: 9, change90d: 25, demand: 86, competition: 81, momentum: 51, status: "cooling down", genres: ["rage", "sample trap"], isCredit: false, isPriority: false },
  { id: "lil-double-0", name: "lil double 0", change24h: 3, change7d: 10, change30d: 25, change90d: 42, demand: 78, competition: 61, momentum: 70, status: "stable", genres: ["street trap", "dark trap"], isCredit: false, isPriority: true },
  { id: "est-gee", name: "est gee", change24h: -3, change7d: 3, change30d: 14, change90d: 29, demand: 84, competition: 72, momentum: 57, status: "cooling down", genres: ["street trap", "aggressive", "dark trap"], isCredit: false, isPriority: false },
]

type RegistryArtist = Pick<Artist, "id" | "name" | "location" | "descriptor" | "genres" | "isCredit" | "isPriority">

const registry = registryData as RegistryArtist[]
const seedsById = new Map(seeds.map((artist) => [artist.id, artist]))

function createFallbackSeed(artist: RegistryArtist, index: number): ArtistSeed {
  return {
    id: artist.id,
    name: artist.name,
    change24h: 0,
    change7d: 0,
    change30d: 0,
    change90d: 0,
    demand: 48 + (index * 7) % 24,
    competition: 35 + (index * 11) % 30,
    momentum: 45 + (index * 5) % 28,
    status: "stable",
    genres: artist.genres,
    isCredit: artist.isCredit,
    isPriority: artist.isPriority,
  }
}

export const artists: Artist[] = registry.map((registryArtist, index) => {
  const artist = seedsById.get(registryArtist.id) ?? createFallbackSeed(registryArtist, index)
  return {
    ...artist,
    ...registryArtist,
    score: 0,
    opportunity: Math.round(artist.demand * 0.45 + artist.momentum * 0.35 + (100 - artist.competition) * 0.2),
    history24h: history(artist.demand - artist.change24h / 3, 12, artist.change24h / 32, index),
    history7d: history(artist.demand - artist.change7d / 3, 14, artist.change7d / 40, index),
    history30d: history(artist.demand - artist.change30d / 2.5, 15, artist.change30d / 38, index),
    history90d: history(artist.demand - artist.change90d / 2, 18, artist.change90d / 40, index),
  }
})
import registryData from "@/data/artist-registry.json"
