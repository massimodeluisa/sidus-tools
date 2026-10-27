import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

type Schema<T extends Record<string, string | number>> = {
  [K in keyof T]: {
    default: T[K]
    parse: (raw: string | null) => T[K]
    serialize?: (v: T[K]) => string
    min?: number
    max?: number
  }
}

/**
 * A schema key whose value is missing serializes as its DEFAULT, never as the
 * string "undefined".
 *
 * `String(undefined)` is `"undefined"`, and a value can legitimately be missing
 * for a moment: a component's local state is captured when it mounts, so any
 * key added to the schema afterwards (a hot reload during development, or a
 * shared link written by an older build) is absent from that state while the
 * key list already contains it. That put a literal `alt=undefined` into the
 * URL, which then travels in every link the user copies.
 */
function serializeValue<T extends Record<string, string | number>>(
  schema: Schema<T>,
  key: keyof T,
  value: T[keyof T],
): string {
  const entry = schema[key]
  const resolved =
    value === undefined || value === null || (typeof value === 'number' && Number.isNaN(value))
      ? entry.default
      : value
  return entry.serialize ? entry.serialize(resolved) : String(resolved)
}

/**
 * Values a URL should never have carried in the first place, treated as absent
 * so a link written by a buggy or older build still opens on the defaults.
 */
const ABSENT_RAW_VALUES = new Set(['', 'undefined', 'null', 'NaN'])

function isAbsent(raw: string | null): raw is null {
  return raw == null || ABSENT_RAW_VALUES.has(raw)
}

function parseAll<T extends Record<string, string | number>>(
  schema: Schema<T>,
  searchParams: URLSearchParams,
  keys: (keyof T)[],
): T {
  const out = {} as T
  for (const key of keys) {
    out[key] = schema[key].parse(searchParams.get(String(key)))
  }
  return out
}

function snapshotKey<T extends Record<string, string | number>>(
  schema: Schema<T>,
  values: T,
  keys: (keyof T)[],
): string {
  return keys.map((k) => `${String(k)}=${serializeValue(schema, k, values[k])}`).join('&')
}

/**
 * Two-way bind tool parameters ↔ URL search params for shareable links.
 * **All** schema keys are always present in the URL, including defaults
 * (e.g. `?body=earth&h=400`).
 *
 * Local state is the source of truth for controlled inputs (sync on keystroke),
 * so the caret does not jump. The URL is updated as a side effect.
 */
export function useToolSearchParams<T extends Record<string, string | number>>(
  schema: Schema<T>,
): [T, (patch: Partial<T>) => void, (key: keyof T, value: T[keyof T]) => void] {
  const [searchParams, setSearchParams] = useSearchParams()
  const keys = Object.keys(schema) as (keyof T)[]

  const urlValues = useMemo(
    () => parseAll(schema, searchParams, keys),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- schema is stable module const
    [searchParams],
  )
  const urlKey = useMemo(
    () => snapshotKey(schema, urlValues, keys),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- schema is stable module const
    [urlValues],
  )

  const [local, setLocal] = useState<T>(urlValues)
  const localKey = snapshotKey(schema, local, keys)
  /**
   * Mirror of `local` that a writer can read WITHOUT the updater form.
   *
   * Writing the URL means updating the router, and doing that from inside a
   * `setLocal(prev => ...)` callback runs it during the render phase, which
   * React reports as updating one component while rendering another. Reading
   * the previous value from here instead keeps the router write in the event
   * handler where it belongs.
   */
  const localRef = useRef<T>(local)
  localRef.current = local

  // Ignore the next URL echo after we write (prevents redundant setState).
  const pendingUrlKey = useRef<string | null>(null)

  // Sync FROM url when it changes externally (back/forward, shared link, other writer).
  useEffect(() => {
    if (pendingUrlKey.current != null) {
      if (urlKey === pendingUrlKey.current) {
        pendingUrlKey.current = null
        return
      }
      pendingUrlKey.current = null
    }
    if (urlKey !== localKey) {
      setLocal(urlValues)
    }
    // Only react to URL identity changes: not local typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: mirror URL → local
  }, [urlKey])

  const writeUrl = useCallback(
    (nextValues: T) => {
      const nextKey = snapshotKey(schema, nextValues, keys)
      pendingUrlKey.current = nextKey
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const key of keys) {
            next.set(String(key), serializeValue(schema, key, nextValues[key]))
          }
          return next
        },
        /* replace: shareable defaults without history spam
           preventScrollReset: writing ?h=400 must not jump the viewport */
        { replace: true, preventScrollReset: true },
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- schema is stable module const
    [setSearchParams],
  )

  /*
   * Materialise missing defaults in the URL, and normalise anything that does
   * not round trip. A key can be PRESENT and still wrong: a stale link carrying
   * `alt=undefined`, or a value outside its allow-list, both read correctly
   * because the parsers are defensive, but the bad text would otherwise sit in
   * the address bar and travel on into every link copied from it. Rewriting
   * what the parser actually resolved is idempotent, so this settles in one
   * pass and does not loop.
   */
  useEffect(() => {
    let stale = false
    for (const key of keys) {
      const raw = searchParams.get(String(key))
      if (raw === null || raw !== serializeValue(schema, key, urlValues[key])) {
        stale = true
        break
      }
    }
    if (stale) {
      writeUrl(local)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when search string changes
  }, [searchParams, writeUrl])

  const setMany = useCallback(
    (patch: Partial<T>) => {
      /* The ref is advanced before the state is, so two patches in the same
         tick still compose the way the updater form used to make them. */
      const merged = { ...localRef.current, ...patch } as T
      /* Declared numeric bounds are enforced on write, not only on parse, so
         live state, local input and the URL can never disagree after a reload. */
      const constrained = constrainStored(schema, merged) as T
      localRef.current = constrained
      setLocal(constrained)
      writeUrl(constrained)
    },
    [writeUrl],
  )

  const setOne = useCallback(
    (key: keyof T, value: T[keyof T]) => {
      setMany({ [key]: value } as Partial<T>)
    },
    [setMany],
  )

  return [local, setMany, setOne]
}

export function numParam(defaultValue: number, opts?: { min?: number; max?: number }) {
  const entry = {
    default: defaultValue,
    parse: (raw: string | null) => {
      if (isAbsent(raw)) return defaultValue
      const n = Number(raw)
      if (!Number.isFinite(n)) return defaultValue
      if (opts?.min != null && n < opts.min) return opts.min
      if (opts?.max != null && n > opts.max) return opts.max
      return n
    },
    min: opts?.min,
    max: opts?.max,
    constrainStored: (value: number) => clampNumericValue(entry, value),
  }
  return entry
}

function clampNumericValue(
  entry: { default: number; min?: number; max?: number },
  value: number,
): number {
  if (!Number.isFinite(value)) return entry.default
  let v = value
  if (typeof entry.min === 'number' && v < entry.min) v = entry.min
  if (typeof entry.max === 'number' && v > entry.max) v = entry.max
  return v
}

export function strParam(defaultValue: string, allowed?: readonly string[]) {
  const entry = {
    default: defaultValue,
    parse: (raw: string | null) => {
      if (isAbsent(raw)) return defaultValue
      if (allowed && !allowed.includes(raw)) return defaultValue
      return raw
    },
    constrainStored: (value: string) => value,
  }
  return entry
}

function isParamEntry(value: unknown): value is { default: unknown; parse?: unknown; min?: number; max?: number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'default' in (value as object) &&
    typeof (value as { parse?: unknown }).parse === 'function'
  )
}

function isSchema(value: unknown): value is Record<string, { default: unknown; parse: (raw: string | null) => unknown; min?: number; max?: number }> {
  if (typeof value !== 'object' || value === null) return false
  const entries = Object.values(value as object)
  if (entries.length === 0) return false
  return entries.every((entry) => isParamEntry(entry))
}

function clampValue(entry: { default: unknown; min?: number; max?: number }, value: unknown): unknown {
  if (typeof value === 'string') return value
  if (typeof value !== 'number') return value
  if (!Number.isFinite(value)) {
    return typeof entry.default === 'number' ? entry.default : value
  }
  let v = value
  if (typeof entry.min === 'number' && v < entry.min) v = entry.min
  if (typeof entry.max === 'number' && v > entry.max) v = entry.max
  return v
}

function constrainObject(
  schema: Record<string, { default: unknown; min?: number; max?: number }>,
  values: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...values }
  for (const key of Object.keys(schema)) {
    if (Object.prototype.hasOwnProperty.call(values, key)) {
      out[key] = clampValue(schema[key], values[key])
    }
  }
  return out
}

export function constrainStored(
  entry: ReturnType<typeof numParam>,
): (value: number) => number
export function constrainStored<T extends Record<string, string | number>>(
  schema: Schema<T>,
): (values: T) => T
export function constrainStored(
  entry: ReturnType<typeof numParam>,
  value: number,
): number
export function constrainStored(
  value: number,
  entry: ReturnType<typeof numParam>,
): number
export function constrainStored<T extends Record<string, string | number>>(
  schema: Schema<T>,
  values: T,
): T
export function constrainStored<T extends Record<string, string | number>>(
  values: T,
  schema: Schema<T>,
): T
export function constrainStored(
  entry: ReturnType<typeof strParam>,
  value: string,
): string
export function constrainStored(
  value: string,
  entry: ReturnType<typeof strParam>,
): string
export function constrainStored(...args: any[]): any {
  if (args.length === 0) return undefined
  if (args.length === 1) {
    const arg = args[0]
    if (isParamEntry(arg)) {
      const entry = arg as { default: unknown; min?: number; max?: number }
      return (value: unknown) => clampValue(entry, value)
    }
    if (isSchema(arg)) {
      const schema = arg as Record<string, { default: unknown; min?: number; max?: number }>
      return (values: unknown) => constrainObject(schema, (values ?? {}) as Record<string, unknown>)
    }
    return arg
  }
  const a = args[0]
  const b = args[1]
  if (isParamEntry(a) && !isSchema(a)) {
    return clampValue(a as { default: unknown; min?: number; max?: number }, b)
  }
  if (isParamEntry(b) && !isSchema(b)) {
    return clampValue(b as { default: unknown; min?: number; max?: number }, a)
  }
  if (isSchema(a)) {
    return constrainObject(a as Record<string, { default: unknown; min?: number; max?: number }>, (b ?? {}) as Record<string, unknown>)
  }
  if (isSchema(b)) {
    return constrainObject(b as Record<string, { default: unknown; min?: number; max?: number }>, (a ?? {}) as Record<string, unknown>)
  }
  return a
}
