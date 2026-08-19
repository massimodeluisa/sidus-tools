/**
 * Shared helpers for the domain-split EXPECTED modules (orbits/rf/systems/ops).
 * Kept out of index.ts so domain modules can import them without a cycle
 * through the barrel that assembles EXPECTED from those same modules.
 */

export type ExpectedFn = (bag: Record<string, number | string>) => Record<string, number>

/** First finite numeric value among `keys`; throws so a missing input is never silent. */
export function num(bag: Record<string, number | string>, ...keys: string[]): number {
  for (const k of keys) {
    const v = bag[k]
    if (typeof v === 'number' && Number.isFinite(v)) return v
  }
  throw new Error(`missing numeric input: ${keys.join(' | ')}`)
}

/** Assign `value` to every language spelling of the same result, skipping nulls. */
export function put(
  out: Record<string, number>,
  names: string[],
  value: number | null | undefined,
): void {
  if (typeof value !== 'number' || !Number.isFinite(value)) return
  for (const n of names) out[n] = value
}
