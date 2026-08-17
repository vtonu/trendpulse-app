import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { artistConfig } from "./artist-config.mjs"

const API_ROOT = "https://www.googleapis.com/youtube/v3"
const OUTPUT_PATH = resolve(dirname(fileURLToPath(import.meta.url)), "../public/data/trends.json")
const LOCAL_ENV_PATH = resolve(dirname(fileURLToPath(import.meta.url)), "../.env.local")
const DAY_MS = 86_400_000

let API_KEY = process.env.YOUTUBE_API_KEY
if (!API_KEY) {
  try {
    const localEnv = await readFile(LOCAL_ENV_PATH, "utf8")
    API_KEY = localEnv.match(/^YOUTUBE_API_KEY=(.+)$/m)?.[1]?.trim()
  } catch {
    // The local file is optional in automated environments.
  }
}

if (!API_KEY) {
  console.error("missing YOUTUBE_API_KEY; add it to your shell or github actions secret")
  process.exit(1)
}

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value))
const average = (values) => values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0
const percentChange = (current, previous) => {
  if (current <= 0 || previous <= 0) return null
  const midpoint = (current + previous) / 2
  const rawChange = ((current - previous) / midpoint) * 100
  return Math.round(Math.tanh(rawChange / 80) * 600) / 10
}

async function youtube(path, params) {
  const url = new URL(`${API_ROOT}/${path}`)
  Object.entries({ ...params, key: API_KEY }).forEach(([key, value]) => url.searchParams.set(key, String(value)))
  const response = await fetch(url)
  if (!response.ok) throw new Error(`youtube ${path} failed: ${response.status} ${await response.text()}`)
  return response.json()
}

async function searchVideos(name, days, order) {
  const publishedAfter = new Date(Date.now() - days * DAY_MS).toISOString()
  const search = await youtube("search", {
    part: "snippet",
    q: `${name} type beat -tutorial -reaction`,
    type: "video",
    videoCategoryId: "10",
    maxResults: "50",
    order,
    publishedAfter,
    relevanceLanguage: "en",
    regionCode: "US",
  })
  const ids = search.items?.map((item) => item.id.videoId).filter(Boolean) ?? []
  if (!ids.length) return []
  const details = await youtube("videos", { part: "snippet,statistics", id: ids.join(",") })
  return details.items ?? []
}

function videoVelocity(video, now) {
  const ageDays = Math.max((now - new Date(video.snippet.publishedAt).getTime()) / DAY_MS, 0.25)
  const views = Number(video.statistics.viewCount ?? 0)
  const likes = Number(video.statistics.likeCount ?? 0)
  const comments = Number(video.statistics.commentCount ?? 0)
  return {
    ageDays,
    velocity: views / ageDays,
    engagement: views ? ((likes + comments * 2) / views) * 100 : 0,
  }
}

function scale(values, value, floor = 20, ceiling = 95) {
  const sorted = [...values].sort((a, b) => a - b)
  const matching = sorted.map((item, index) => ({ item, index })).filter(({ item }) => item === value)
  const rank = average(matching.map(({ index }) => index))
  return Math.round(floor + (rank / Math.max(sorted.length - 1, 1)) * (ceiling - floor))
}

function momentumScore(ratio) {
  if (!Number.isFinite(ratio) || ratio <= 0) return 50
  return Math.round(clamp(50 + Math.log2(ratio) * 18, 15, 95))
}

function dateKey(value) {
  return new Date(value).toISOString().slice(0, 10)
}

function migrateSnapshots(previous, updatedAt) {
  if (Array.isArray(previous?.dailySnapshots)) return previous.dailySnapshots
  if (!Array.isArray(previous?.history90d)) return []

  const lastDate = new Date(updatedAt ?? Date.now())
  return previous.history90d.map((pulse, index, history) => {
    const date = new Date(lastDate)
    date.setUTCDate(date.getUTCDate() - (history.length - 1 - index))
    return { date: dateKey(date), pulse }
  })
}

function appendSnapshot(previous, snapshot, updatedAt) {
  const history = migrateSnapshots(previous, updatedAt)
    .filter((item) => item?.date && Number.isFinite(item?.pulse))
  const withoutToday = history.filter((item) => item.date !== snapshot.date)
  return [...withoutToday, snapshot].slice(-90)
}

function historyForDays(snapshots, days) {
  const cutoff = new Date(`${snapshots.at(-1)?.date}T00:00:00.000Z`)
  cutoff.setUTCDate(cutoff.getUTCDate() - days)
  const values = snapshots
    .filter((item) => new Date(`${item.date}T00:00:00.000Z`) >= cutoff)
    .map((item) => item.pulse)
  if (values.length === 1) return [values[0], values[0]]
  return values
}

function confidenceScore(sampleSize, recentSize, cohorts) {
  const sampleCoverage = clamp((sampleSize / 60) * 100)
  const recentCoverage = clamp((recentSize / 30) * 100)
  const timeCoverage = (cohorts.filter((size) => size > 0).length / cohorts.length) * 100
  return Math.round(sampleCoverage * 0.5 + recentCoverage * 0.3 + timeCoverage * 0.2)
}

function changeSignal(value) {
  if (value === null) return 50
  return clamp(50 + value * 0.75, 15, 95)
}

function signalReason({ confidence, change24h, change7d, change30d, demand, competition }) {
  if (confidence < 40) return "limited data"
  if (change30d !== null && change30d >= 25) return "strong 30d growth"
  if (change24h !== null && change24h >= 25) return "24h spike"
  if (change7d !== null && change7d >= 15) return "strong 7d growth"
  if (demand >= 70 && competition <= 55) return "strong demand, less competition"
  if (demand >= 70) return "steady demand"
  if (change30d !== null && change30d <= -20) return "30d decline"
  return "mixed market signals"
}

function getStatus(demand, competition, momentum, opportunity) {
  if (opportunity >= 70 && competition <= 60) return "strong opportunity"
  if (momentum >= 68) return "rising fast"
  if (competition >= 76 && demand >= 65) return "saturated"
  if (momentum <= 38) return "cooling down"
  return "stable"
}

async function readPrevious() {
  try { return JSON.parse(await readFile(OUTPUT_PATH, "utf8")) } catch { return { artists: [] } }
}

async function collectArtist(artist) {
  const [recent, longRange] = await Promise.all([
    searchVideos(artist.name, 7, "date"),
    searchVideos(artist.name, 90, "viewCount"),
  ])
  const unique = [...new Map([...recent, ...longRange].map((video) => [video.id, video])).values()]
  const now = Date.now()
  const metrics = unique.map((video) => videoVelocity(video, now))
  const cohort = (minimum, maximum) => metrics.filter((item) => item.ageDays > minimum && item.ageDays <= maximum)
  const activity = (minimum, maximum) => average(cohort(minimum, maximum).map((item) => item.velocity))
  const topVelocity = average([...metrics].sort((a, b) => b.velocity - a.velocity).slice(0, 10).map((item) => item.velocity))
  const engagement = average(metrics.map((item) => item.engagement))
  const recentActivity = activity(0, 7)
  const baselineActivity = activity(7, 90)
  const cohortSizes = [cohort(0, 1).length, cohort(1, 7).length, cohort(7, 30).length, cohort(30, 90).length]
  return {
    ...artist,
    rawDemand: Math.log1p(topVelocity) + Math.log1p(engagement) * 0.2,
    rawCompetition: recent.length,
    rawMomentum: recentActivity > 0 && baselineActivity > 0 ? recentActivity / baselineActivity : 1,
    sampleSize: unique.length,
    recentSize: recent.length,
    cohortSizes,
    changes: {
      change24h: percentChange(activity(0, 1), activity(1, 7)),
      change7d: percentChange(activity(0, 7), activity(7, 30)),
      change30d: percentChange(activity(0, 30), activity(30, 90)),
    },
  }
}

async function main() {
  console.log(`collecting youtube signals for ${artistConfig.length} artists`)
  const raw = []
  for (const artist of artistConfig) {
    raw.push(await collectArtist(artist))
    console.log(`collected ${artist.name}`)
  }

  const previous = await readPrevious()
  const demandValues = raw.map((artist) => artist.rawDemand)
  const competitionValues = raw.map((artist) => artist.rawCompetition)
  const artists = raw.map((artist) => {
    const old = previous.artists?.find((item) => item.id === artist.id)
    const demand = scale(demandValues, artist.rawDemand)
    const competition = scale(competitionValues, artist.rawCompetition, 18, 90)
    const momentum = momentumScore(artist.rawMomentum)
    const confidence = confidenceScore(artist.sampleSize, artist.recentSize, artist.cohortSizes)
    const sustainedMomentum = Math.round(
      momentum * 0.5 +
      changeSignal(artist.changes.change7d) * 0.2 +
      changeSignal(artist.changes.change30d) * 0.3
    )
    const opportunity = Math.round(
      demand * 0.35 +
      sustainedMomentum * 0.3 +
      (100 - competition) * 0.2 +
      confidence * 0.15
    )
    const pulse = Math.round(demand * 0.4 + momentum * 0.35 + (100 - competition) * 0.25)
    const dailySnapshots = appendSnapshot(old, {
      date: dateKey(Date.now()),
      pulse,
      demand,
      competition,
      momentum,
      sustainedMomentum,
      opportunity,
      confidence,
    }, previous.updatedAt)
    const reason = signalReason({ confidence, ...artist.changes, demand, competition })
    return {
      id: artist.id,
      demand,
      competition,
      momentum,
      sustainedMomentum,
      opportunity,
      confidence,
      reason,
      status: getStatus(demand, competition, momentum, opportunity),
      sampleSize: artist.sampleSize,
      ...artist.changes,
      change90d: old?.demand ? percentChange(demand, old.demand) : null,
      dailySnapshots,
      history24h: historyForDays(dailySnapshots, 1),
      history7d: historyForDays(dailySnapshots, 7),
      history30d: historyForDays(dailySnapshots, 30),
      history90d: historyForDays(dailySnapshots, 90),
    }
  })

  await mkdir(dirname(OUTPUT_PATH), { recursive: true })
  await writeFile(OUTPUT_PATH, `${JSON.stringify({ updatedAt: new Date().toISOString(), source: "youtube", artists }, null, 2)}\n`)
  console.log(`wrote ${OUTPUT_PATH}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
