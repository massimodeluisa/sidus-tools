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

/**
 * Symbol-keyed alias-group ledger attached to the `Record<string, number>` a
 * `put()` call writes into. Non-enumerable to `Object.keys`/`JSON.stringify`,
 * so it never changes the flat public shape `ExpectedFn` callers rely on
 * (the verify runner's `covered`/`compared.length===0` checks, the
 * `expected.test.ts` key-count assertions, `report.json`, …) — it only rides
 * along on the same object for consumers that know to look it up.
 */
const ALIAS_GROUPS = Symbol('put() alias groups')

type WithAliasGroups = Record<string, number> & { [ALIAS_GROUPS]?: string[][] }

/**
 * Assign `value` to every language spelling of the same result, skipping
 * nulls. A call with 2+ `names` declares those spellings as ONE logical
 * value with multiple acceptable printed names (e.g. `T`/`t`, `x_mid`/
 * `xMid`): different language ports print only one of them, so the verify
 * runner must treat the group as a unit (see `getAliasGroups` /
 * `scripts/verify-snippets.ts`'s `compareResults`), not fail on every
 * spelling a given language didn't happen to print.
 */
export function put(
  out: Record<string, number>,
  names: string[],
  value: number | null | undefined,
): void {
  if (typeof value !== 'number' || !Number.isFinite(value)) return
  for (const n of names) out[n] = value
  if (names.length > 1) {
    const withGroups = out as WithAliasGroups
    ;(withGroups[ALIAS_GROUPS] ??= []).push([...names])
  }
}

/** Alias groups `put()` declared on `out` (`[]` if none), in declaration order. */
export function getAliasGroups(out: Record<string, number>): string[][] {
  return (out as WithAliasGroups)[ALIAS_GROUPS] ?? []
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
