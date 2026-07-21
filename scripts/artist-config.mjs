import { readFile } from "node:fs/promises"

const registryUrl = new URL("../src/data/artist-registry.json", import.meta.url)
export const artistConfig = JSON.parse(await readFile(registryUrl, "utf8"))
