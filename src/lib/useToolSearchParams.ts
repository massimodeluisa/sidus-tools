import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

type Schema<T extends Record<string, string | number>> = {
  [K in keyof T]: {
    default: T[K]
    parse: (raw: string | null) => T[K]
    serialize?: (v: T[K]) => string
  }
}

function serializeValue<T extends Record<string, string | number>>(
  schema: Schema<T>,
  key: keyof T,
  value: T[keyof T],
): string {
  const entry = schema[key]
  return entry.serialize ? entry.serialize(value) : String(value)
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
        // replace: shareable defaults without history spam
        // preventScrollReset: writing ?h=400 must not jump the viewport
        { replace: true, preventScrollReset: true },
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- schema is stable module const
    [setSearchParams],
  )

  // Materialise missing defaults in the URL once.
  useEffect(() => {
    let incomplete = false
    for (const key of keys) {
      if (!searchParams.has(String(key))) {
        incomplete = true
        break
      }
    }
    if (incomplete) {
      writeUrl(local)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when search string changes
  }, [searchParams, writeUrl])

  const setMany = useCallback(
    (patch: Partial<T>) => {
      setLocal((prev) => {
        const merged = { ...prev, ...patch } as T
        writeUrl(merged)
        return merged
      })
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
  return {
    default: defaultValue,
    parse: (raw: string | null) => {
      if (raw == null || raw === '') return defaultValue
      const n = Number(raw)
      if (!Number.isFinite(n)) return defaultValue
      if (opts?.min != null && n < opts.min) return opts.min
      if (opts?.max != null && n > opts.max) return opts.max
      return n
    },
  }
}

export function strParam(defaultValue: string, allowed?: readonly string[]) {
  return {
    default: defaultValue,
    parse: (raw: string | null) => {
      if (raw == null || raw === '') return defaultValue
      if (allowed && !allowed.includes(raw)) return defaultValue
      return raw
    },
  }
}
