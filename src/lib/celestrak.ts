/**
 * CelesTrak GP queries and TLE parsing, shared by the tools that look
 * satellites up by catalogue number or name.
 *
 * Etiquette matters here: CelesTrak asks that clients not re-request the same
 * elements repeatedly, and element sets are only updated a few times a day
 * anyway. Every response is therefore cached for two hours, in memory and in
 * localStorage, so a page reload or a repeated search costs nothing.
 */

import stationsSnap from '@/data/tle/stations.txt?raw'
import gpsOpsSnap from '@/data/tle/gps-ops.txt?raw'
import gloOpsSnap from '@/data/tle/glo-ops.txt?raw'
import galileoSnap from '@/data/tle/galileo.txt?raw'
import beidouSnap from '@/data/tle/beidou.txt?raw'
import weatherSnap from '@/data/tle/weather.txt?raw'
import scienceSnap from '@/data/tle/science.txt?raw'
import starlinkSnap from '@/data/tle/starlink.txt?raw'

/** One element set, with the name line CelesTrak returns above it. */
export type TleRecord = {
  /** NORAD catalogue number, read from line 1 (columns 3-7). */
  catnr: string
  name: string
  line1: string
  line2: string
}

export const CELESTRAK_GP_URL = 'https://celestrak.org/NORAD/elements/gp.php'
/** SATCAT search. The GP dump index `/NORAD/elements/` is not a catalogue browser. */
export const CELESTRAK_CATALOG_URL = 'https://celestrak.org/satcat/search.php'
/** CelesTrak etiquette: reuse a stored response for this long before re-asking. */
export const CELESTRAK_CACHE_TTL_MS = 2 * 60 * 60 * 1000
const CACHE_PREFIX = 'sidus.celestrak.'
const BLOCK_PREFIX = 'sidus.celestrak.block.'
/** Results shown for one search. A NAME query can match hundreds. */
export const CELESTRAK_MAX_RESULTS = 40

/**
 * CelesTrak GROUP names for the presets the swarm offers. These are the
 * endpoint's own group identifiers, not our invention, so they stay valid as
 * the catalogue changes.
 */
export const CELESTRAK_GROUPS = {
  stations: 'stations',
  starlink: 'starlink',
  gps: 'gps-ops',
  glonass: 'glo-ops',
  galileo: 'galileo',
  beidou: 'beidou',
  weather: 'weather',
  science: 'science',
} as const

export type CelestrakGroupId = keyof typeof CELESTRAK_GROUPS

/**
 * The single parser for the `groups` URL parameter shared by the swarm and
 * the scene deep links. An unknown group id is dropped rather than kept: the
 * id set is ours, and a stale or hand-edited link must not turn into a request.
 */
export function parseGroupIds(raw: string): CelestrakGroupId[] {
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter((id): id is CelestrakGroupId => id in CELESTRAK_GROUPS)
}

/** Dated copies for when the live endpoint is silent. */
const TLE_SNAPSHOTS: Partial<Record<CelestrakGroupId, string>> = {
  stations: stationsSnap,
  starlink: starlinkSnap,
  gps: gpsOpsSnap,
  glonass: gloOpsSnap,
  galileo: galileoSnap,
  beidou: beidouSnap,
  weather: weatherSnap,
  science: scienceSnap,
}

function snapshotRecords(group: CelestrakGroupId): TleRecord[] {
  const text = TLE_SNAPSHOTS[group]
  if (!text) return []
  return parseTleRecords(text)
}

/**
 * How a group request ended. A group is the mass path, so the caller has to be
 * able to tell "CelesTrak will not resend this" from "the request failed":
 * only the second one is worth an error, and the first one still has data.
 */
export type CelestrakGroupFrom = 'live' | 'cache' | 'snapshot'

export type CelestrakGroupOutcome =
  | { ok: true; records: TleRecord[]; stale: boolean; from: CelestrakGroupFrom }
  | { ok: false; reason: 'throttled' | 'failed'; retryAfterMs: number | null }

export type CelestrakGroupOptions = {
  signal?: AbortSignal
  /** Called as the body arrives; total is null when the server sends no length. */
  onProgress?: (received: number, total: number | null) => void
}

/**
 * Every element set in a group. Groups run to thousands of satellites, so this
 * deliberately skips the per-search result cap; the two-hour cache is what
 * keeps the endpoint from being asked twice.
 *
 * CelesTrak enforces that etiquette itself: asking again for a group whose
 * elements have not changed since your last successful download is answered
 * with HTTP 403 and "GP data has not updated since your last successful
 * download of GROUP=... at <time>". That reply means the copy already on disk
 * IS the current answer, so it is served whatever age our own TTL assigns it.
 * The same holds for a request that never arrives: a stored copy beats nothing.
 */
const groupInFlight = new Map<string, Promise<CelestrakGroupOutcome>>()

/**
 * Documented GP URL: `{QUERY}=VALUE[&FORMAT=VALUE]`. FORMAT is optional and
 * has defaulted to CSV since 2026-05-09, so TLE must be asked for explicitly.
 * Putting FORMAT first still parses in PHP; it is not what CelesTrak publishes.
 */
export function groupQueryUrl(group: CelestrakGroupId): string {
  return `${CELESTRAK_GP_URL}?GROUP=${CELESTRAK_GROUPS[group]}&FORMAT=TLE`
}

/** Query string used through 2026-08, kept so a stored dump still counts. */
function legacyGroupQueryUrl(group: CelestrakGroupId): string {
  return `${CELESTRAK_GP_URL}?FORMAT=TLE&GROUP=${CELESTRAK_GROUPS[group]}`
}

export async function fetchCelestrakGroup(
  group: CelestrakGroupId,
  options: CelestrakGroupOptions = {},
): Promise<CelestrakGroupOutcome> {
  const url = groupQueryUrl(group)
  const cached = readCache(url) ?? readCache(legacyGroupQueryUrl(group))
  if (cached !== null) return { ok: true, records: parseTleRecords(cached), stale: false, from: 'cache' }
  if (isBlocked(url)) {
    const stored = readCache(url, { anyAge: true }) ?? readCache(legacyGroupQueryUrl(group), { anyAge: true })
    if (stored !== null) return { ok: true, records: parseTleRecords(stored), stale: true, from: 'cache' }
    const snap = snapshotRecords(group)
    if (snap.length > 0) return { ok: true, records: snap, stale: true, from: 'snapshot' }
    return { ok: false, reason: 'throttled', retryAfterMs: Math.max(0, (blockedUntil.get(url) ?? Date.now()) - Date.now()) }
  }

  const existing = groupInFlight.get(url)
  if (existing) return existing

  const pending = loadCelestrakGroup(group, url, options)
  groupInFlight.set(url, pending)
  try {
    return await pending
  } finally {
    groupInFlight.delete(url)
  }
}

/**
 * Live group download. No client timeout: CelesTrak often takes well over
 * ten seconds, and aborting then retrying is what produces the 403 empty
 * list. Byte-progress setState on the globe is also avoided; the body is
 * read in one go.
 */
async function loadCelestrakGroup(
  group: CelestrakGroupId,
  url: string,
  options: CelestrakGroupOptions,
): Promise<CelestrakGroupOutcome> {
  const staleOf = () =>
    readCache(url, { anyAge: true }) ?? readCache(legacyGroupQueryUrl(group), { anyAge: true })
  try {
    const response = await fetch(url, { signal: options.signal })
    if (!response.ok) {
      blockUrl(url, response.headers.get('Retry-After'))
      const stored = staleOf()
      if (stored !== null) return { ok: true, records: parseTleRecords(stored), stale: true, from: 'cache' }
      const snap = snapshotRecords(group)
      if (snap.length > 0) return { ok: true, records: snap, stale: true, from: 'snapshot' }
      return {
        ok: false,
        reason: response.status === 403 || response.status === 429 ? 'throttled' : 'failed',
        retryAfterMs: retryAfterMs(response.headers.get('Retry-After')),
      }
    }
    const text = await response.text()
    options.onProgress?.(text.length, text.length)
    const records = parseTleRecords(text)
    if (records.length > 0) writeCache(url, text)
    return { ok: true, records, stale: false, from: 'live' }
  } catch {
    const stored = staleOf()
    if (stored !== null) return { ok: true, records: parseTleRecords(stored), stale: true, from: 'cache' }
    const snap = snapshotRecords(group)
    if (snap.length > 0) return { ok: true, records: snap, stale: true, from: 'snapshot' }
    return { ok: false, reason: 'failed', retryAfterMs: null }
  }
}

/** Retry-After as milliseconds from now, for either of the forms HTTP allows. */
export function retryAfterMs(header: string | null): number | null {
  if (header === null) return null
  const trimmed = header.trim()
  if (trimmed === '') return null
  const seconds = Number(trimmed)
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000)
  const at = Date.parse(trimmed)
  return Number.isNaN(at) ? null : Math.max(0, at - Date.now())
}

/**
 * The query string for a lookup. All-digits is a catalogue number, anything
 * else is a name substring, matching what CelesTrak's own GP endpoint accepts.
 */
export function celestrakSelector(query: string): string {
  const trimmed = query.trim()
  if (trimmed === '') return ''
  return /^\d+$/.test(trimmed)
    ? `CATNR=${trimmed}`
    : `NAME=${encodeURIComponent(trimmed.toUpperCase())}`
}

/** Full request URL for a query, or null when there is nothing to ask for. */
export function celestrakQueryUrl(query: string): string | null {
  const selector = celestrakSelector(query)
  return selector === '' ? null : `${CELESTRAK_GP_URL}?${selector}&FORMAT=TLE`
}

/** Catalogue number from a TLE's line 1, columns 3-7 in the fixed-width format. */
export function catnrOf(line1: string): string {
  return line1.slice(2, 7).trim()
}

/**
 * Every complete (name, line 1, line 2) triple in a TLE-format response.
 *
 * CelesTrak answers a NAME query with many triples back to back, and returns a
 * plain text error body ("No GP data found") with HTTP 200 when nothing
 * matches, so a caller cannot rely on the status alone: an empty list is the
 * signal.
 */
export function parseTleRecords(text: string): TleRecord[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
  const out: TleRecord[] = []
  for (let i = 0; i < lines.length - 2; i++) {
    if (!lines[i + 1].startsWith('1 ') || !lines[i + 2].startsWith('2 ')) continue
    out.push({
      catnr: catnrOf(lines[i + 1]),
      name: lines[i],
      line1: lines[i + 1],
      line2: lines[i + 2],
    })
    i += 2
  }
  return out
}

/** The three lines back in the form the SGP4 parser takes. */
export function tleText(record: TleRecord): string {
  return `${record.name}\n${record.line1}\n${record.line2}`
}

const STORED_TLE_PREFIX = 'sidus.tle.catnr.'

/** Last TLE text saved for a catalogue number, kept beside the CelesTrak response cache. */
export function readStoredTle(catnr: string): string | null {
  const key = STORED_TLE_PREFIX + catnr.trim()
  try {
    const raw = globalThis.localStorage?.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { text?: unknown }
    return typeof parsed.text === 'string' && parsed.text.includes('1 ') ? parsed.text : null
  } catch {
    return null
  }
}

export function writeStoredTle(catnr: string, text: string): void {
  try {
    globalThis.localStorage?.setItem(
      STORED_TLE_PREFIX + catnr.trim(),
      JSON.stringify({ text, storedAt: Date.now() }),
    )
  } catch {
    /* Quota or private mode: the in-memory CelesTrak cache still covers this tab. */
  }
}

/** Bundled stations.txt record for a NORAD catalogue number, or null. */
export function bundledStationByCatnr(catnr: string): TleRecord | null {
  const want = catnr.trim().replace(/^0+/, '')
  if (!want) return null
  return snapshotRecords('stations').find((record) => record.catnr.replace(/^0+/, '') === want) ?? null
}

type CacheEntry = { fetchedAt: number; text: string }

const memoryCache = new Map<string, CacheEntry>()

function readEntry(url: string): CacheEntry | null {
  const inMemory = memoryCache.get(url)
  if (inMemory) return inMemory
  try {
    const raw = globalThis.localStorage?.getItem(CACHE_PREFIX + url)
    if (!raw) return null
    const entry = JSON.parse(raw) as Partial<CacheEntry>
    if (typeof entry.text !== 'string' || typeof entry.fetchedAt !== 'number') return null
    memoryCache.set(url, entry as CacheEntry)
    return entry as CacheEntry
  } catch {
    return null
  }
}

/** The stored response, or null. `anyAge` ignores the TTL for the fallback path. */
function readCache(url: string, { anyAge = false }: { anyAge?: boolean } = {}): string | null {
  const entry = readEntry(url)
  if (entry === null) return null
  if (!anyAge && Date.now() - entry.fetchedAt > CELESTRAK_CACHE_TTL_MS) return null
  return entry.text
}

/** CelesTrak usage policy: after a non-200, do not hit that URL again this cycle. */
const blockedUntil = new Map<string, number>()

function isBlocked(url: string): boolean {
  const until = blockedUntil.get(url) ?? readBlock(url)
  if (until === null) return false
  if (Date.now() >= until) {
    blockedUntil.delete(url)
    clearBlock(url)
    return false
  }
  blockedUntil.set(url, until)
  return true
}

function blockUrl(url: string, retryAfterHeader: string | null): void {
  const until = Date.now() + (retryAfterMs(retryAfterHeader) ?? CELESTRAK_CACHE_TTL_MS)
  blockedUntil.set(url, until)
  try {
    globalThis.localStorage?.setItem(BLOCK_PREFIX + url, String(until))
  } catch {
    /* Memory still holds the block for this session. */
  }
}

function readBlock(url: string): number | null {
  try {
    const raw = globalThis.localStorage?.getItem(BLOCK_PREFIX + url)
    if (!raw) return null
    const until = Number(raw)
    return Number.isFinite(until) ? until : null
  } catch {
    return null
  }
}

function clearBlock(url: string): void {
  try {
    globalThis.localStorage?.removeItem(BLOCK_PREFIX + url)
  } catch {
    /* ignore */
  }
}

export function groupCacheAgeMs(group: CelestrakGroupId): number | null {
  const entry = readEntry(groupQueryUrl(group)) ?? readEntry(legacyGroupQueryUrl(group))
  if (entry === null) return null
  return Date.now() - entry.fetchedAt
}

export function groupCacheIsFresh(group: CelestrakGroupId): boolean {
  const age = groupCacheAgeMs(group)
  return age !== null && age <= CELESTRAK_CACHE_TTL_MS
}

export function queryCacheIsFresh(query: string): boolean {
  const url = celestrakQueryUrl(query)
  if (url === null) return false
  const entry = readEntry(url) ?? readEntry(`${CELESTRAK_GP_URL}?FORMAT=TLE&${celestrakSelector(query)}`)
  return entry !== null && Date.now() - entry.fetchedAt <= CELESTRAK_CACHE_TTL_MS
}

function writeCache(url: string, text: string): void {
  const entry: CacheEntry = { fetchedAt: Date.now(), text }
  memoryCache.set(url, entry)
  try {
    globalThis.localStorage?.setItem(CACHE_PREFIX + url, JSON.stringify(entry))
  } catch {
    /*
     * Storage full or disabled: the memory cache still spares the repeat
     * request, and a failure here must never surface as a fetch failure.
     * Measured headroom on Chrome: the Starlink group is 1,805,328 chars
     * (3.44 MB as UTF-16) and stores fine inside a roughly 10 MB origin
     * budget, with no effect on later small writes. An engine with a tighter
     * budget would drop this entry, which costs only the stale-copy fallback
     * the next time CelesTrak declines to resend.
     */
  }
}

const SATCAT_RECORDS_URL = 'https://celestrak.org/satcat/records.php'
const WIKIDATA_API = 'https://www.wikidata.org/w/api.php'
/** How many CATNR follow-ups a name fallback may fire. */
const NAME_FALLBACK_CATNR_CAP = 8

async function fetchGpRecords(url: string, signal?: AbortSignal): Promise<TleRecord[]> {
  const cached = readCache(url)
  if (cached !== null) return parseTleRecords(cached)
  if (isBlocked(url)) throw new Error('CelesTrak blocked this query for the rest of the update cycle')
  const response = await fetch(url, { signal })
  if (!response.ok) {
    blockUrl(url, response.headers.get('Retry-After'))
    throw new Error(`CelesTrak responded ${response.status}`)
  }
  const text = await response.text()
  const records = parseTleRecords(text)
  if (records.length > 0) writeCache(url, text)
  return records
}

async function recordsForCatnrs(catnrs: string[], signal?: AbortSignal): Promise<TleRecord[]> {
  const out: TleRecord[] = []
  const seen = new Set<string>()
  for (const catnr of catnrs) {
    if (seen.has(catnr) || out.length >= NAME_FALLBACK_CATNR_CAP) break
    seen.add(catnr)
    const url = celestrakQueryUrl(catnr)
    if (url === null) continue
    try {
      for (const record of await fetchGpRecords(url, signal)) {
        if (out.some((row) => row.catnr === record.catnr)) continue
        out.push(record)
        if (out.length >= NAME_FALLBACK_CATNR_CAP) return out
      }
    } catch {
      /* Usage policy: a non-200 means stop, do not walk the rest of the list. */
      break
    }
  }
  return out
}

function catnrsFromWikidataEntities(body: unknown): string[] {
  if (!body || typeof body !== 'object') return []
  const entities = (body as { entities?: unknown }).entities
  if (!entities || typeof entities !== 'object') return []
  const catnrs: string[] = []
  for (const entity of Object.values(entities as Record<string, unknown>)) {
    if (!entity || typeof entity !== 'object') continue
    const claims = (entity as { claims?: unknown }).claims
    if (!claims || typeof claims !== 'object') continue
    const p377 = (claims as { P377?: unknown }).P377
    if (!Array.isArray(p377) || p377.length === 0) continue
    const snak = p377[0] && typeof p377[0] === 'object' ? (p377[0] as { mainsnak?: unknown }).mainsnak : undefined
    const datavalue =
      snak && typeof snak === 'object' ? (snak as { datavalue?: unknown }).datavalue : undefined
    const value =
      datavalue && typeof datavalue === 'object' ? (datavalue as { value?: unknown }).value : undefined
    if (typeof value === 'string' && /^\d+$/.test(value)) catnrs.push(value)
  }
  return catnrs
}

function uniqueCatnrs(ids: string[]): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const id of ids) {
    if (!/^\d+$/.test(id) || seen.has(id)) continue
    seen.add(id)
    out.push(id)
  }
  return out
}

/** SATCAT OBJECT_NAME search. Same NAME key as GP; sometimes a different spelling. */
async function catnrsFromSatcat(name: string, signal?: AbortSignal): Promise<string[]> {
  const url = `${SATCAT_RECORDS_URL}?NAME=${encodeURIComponent(name.toUpperCase())}&FORMAT=JSON`
  try {
    const response = await fetch(url, { signal })
    if (!response.ok) {
      blockUrl(url, response.headers.get('Retry-After'))
      return []
    }
    const data: unknown = await response.json()
    if (!Array.isArray(data)) return []
    const ids: string[] = []
    for (const row of data) {
      if (!row || typeof row !== 'object') continue
      const id = (row as { NORAD_CAT_ID?: unknown }).NORAD_CAT_ID
      if (typeof id === 'number' && Number.isFinite(id)) ids.push(String(Math.trunc(id)))
      else if (typeof id === 'string' && /^\d+$/.test(id.trim())) ids.push(id.trim())
    }
    return uniqueCatnrs(ids).slice(0, NAME_FALLBACK_CATNR_CAP)
  } catch {
    return []
  }
}

/**
 * Common names that are not the TLE name (Hubble vs HST) live on Wikidata as
 * P377, the NORAD catalogue number. Live lookup, not a local alias table.
 */
async function catnrsFromWikidata(query: string, signal?: AbortSignal): Promise<string[]> {
  const searchUrl = `${WIKIDATA_API}?${new URLSearchParams({
    action: 'wbsearchentities',
    search: query,
    language: 'en',
    format: 'json',
    origin: '*',
    type: 'item',
    limit: '8',
  }).toString()}`
  try {
    const searchResponse = await fetch(searchUrl, { signal })
    if (!searchResponse.ok) return []
    const searchBody: unknown = await searchResponse.json()
    const hits =
      searchBody && typeof searchBody === 'object' && Array.isArray((searchBody as { search?: unknown }).search)
        ? ((searchBody as { search: { id?: unknown }[] }).search)
        : []
    const ids = hits.map((hit) => hit.id).filter((id): id is string => typeof id === 'string' && id.length > 0)
    if (ids.length === 0) return []
    const entityUrl = `${WIKIDATA_API}?${new URLSearchParams({
      action: 'wbgetentities',
      ids: ids.join('|'),
      props: 'claims',
      format: 'json',
      origin: '*',
    }).toString()}`
    const entityResponse = await fetch(entityUrl, { signal })
    if (!entityResponse.ok) return []
    const entityBody: unknown = await entityResponse.json()
    return uniqueCatnrs(catnrsFromWikidataEntities(entityBody)).slice(0, NAME_FALLBACK_CATNR_CAP)
  } catch {
    return []
  }
}

/**
 * Looks a query up, cache first. Returns an empty list for "nothing found" and
 * throws only when the request itself failed, so callers can tell the two apart.
 *
 * A GP NAME query matches the TLE name line, which is why "hubble" is empty
 * and "HST" is not. When that happens we ask SATCAT and then Wikidata P377
 * (the NORAD number) and fetch those catalogue numbers. No local alias table.
 */
export async function searchCelestrak(
  query: string,
  signal?: AbortSignal,
): Promise<TleRecord[]> {
  const url = celestrakQueryUrl(query)
  if (url === null) return []
  const trimmed = query.trim()
  const legacyUrl = `${CELESTRAK_GP_URL}?FORMAT=TLE&${celestrakSelector(query)}`
  const cached = readCache(url) ?? readCache(legacyUrl)
  if (cached !== null) {
    const fromCache = parseTleRecords(cached)
    if (fromCache.length > 0 || /^\d+$/.test(trimmed)) {
      return fromCache.slice(0, CELESTRAK_MAX_RESULTS)
    }
  }

  let records: TleRecord[] = []
  let gpRejected = false
  try {
    records = await fetchGpRecords(url, signal)
  } catch (error) {
    if (/^\d+$/.test(trimmed)) throw error
    gpRejected = true
    records = []
  }
  if (records.length > 0 || /^\d+$/.test(trimmed)) return records.slice(0, CELESTRAK_MAX_RESULTS)
  /* A 403/404/50x is a stop: more CelesTrak queries would ignore the policy.
     Fallbacks run only when GP answered 200 with an empty NAME match. */
  if (gpRejected) return []

  const catnrs = uniqueCatnrs([
    ...(await catnrsFromSatcat(trimmed, signal)),
    ...(await catnrsFromWikidata(trimmed, signal)),
  ])
  if (catnrs.length === 0) return []
  return recordsForCatnrs(catnrs, signal)
}
