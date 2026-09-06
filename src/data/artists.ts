export type TimeRange = "24h" | "7d" | "30d" | "90d"

export type Artist = {
  id: string
  name: string
  hasData: boolean
  score: number
  change24h: number | null
  change7d: number | null
  change30d: number | null
  change90d: number | null
  demand: number
  competition: number
  momentum: number
  sustainedMomentum: number
  opportunity: number
  confidence: number
  reason: string
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
  dailySnapshots?: Array<{
    date: string
    pulse: number
    demand?: number
    competition?: number
    momentum?: number
    sustainedMomentum?: number
    opportunity?: number
    confidence?: number
  }>
}

import registryData from "@/data/artist-registry.json"

type RegistryArtist = Pick<Artist, "id" | "name" | "location" | "descriptor" | "genres" | "isCredit" | "isPriority">

export const artists: Artist[] = (registryData as RegistryArtist[]).map((artist) => ({
  ...artist,
  score: 0,
  change24h: null,
  change7d: null,
  change30d: null,
  change90d: null,
  demand: 0,
  competition: 0,
  momentum: 0,
  sustainedMomentum: 0,
  opportunity: 0,
  confidence: 0,
  reason: "collecting data",
  status: "stable",
  hasData: false,
  history24h: [],
  history7d: [],
  history30d: [],
  history90d: [],
}))
