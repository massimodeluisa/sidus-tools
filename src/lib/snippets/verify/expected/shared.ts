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

/**
 * A justified, per-(tool, scenario, result-key) absolute-tolerance override. Exists
 * only for documented numerical ill-conditioning that makes the default relative
 * tolerance unattainable across independent libm implementations (e.g. acos near
 * |x|=1), never as a general escape hatch for a real branch/sign/formula bug — those
 * still produce errors many orders of magnitude larger than any override here and the
 * default relative gate still catches them. `why` is mandatory and must be non-empty;
 * the runner refuses (fails the cell loudly) rather than silently apply an override
 * missing one.
 */
export type ToleranceOverride = { absTol: number; why: string }

/** toolId -> scenario name -> printed result key -> override. */
export type ToleranceOverrides = Record<string, Record<string, Record<string, ToleranceOverride>>>
