/**
 * Tool page UI layout driven by URL search params (+ optional localStorage prefs).
 *
 * ## Focus mode
 * - `focus=1`: hide site header/footer and tool chrome (instrument workspace)
 * - Esc exits focus; shareable URL keeps physics params
 *
 * ## Shell slot sizes (params / results / preview / code)
 * - `params=half|full|compact` (default half)
 * - `preview=0` / `code=0` hides that slot
 *
 * ## Block order
 * - `blocks=tool,precision,sources`
 *
 * Layout keys are independent of tool physics params.
 * User layout changes are also stored in localStorage so the next tool
 * opens with the same defaults (still overridable per-URL).
 */

export type SlotSize = 'half' | 'full' | 'compact' | 'hidden'

export type PageBlockId = 'tool' | 'precision' | 'sources' | 'edit'

export type ShellSlotId = 'params' | 'results' | 'preview' | 'code'

export type ToolUiChrome = {
  focus: boolean
  title: boolean
  subtitle: boolean
  formula: boolean
  back: boolean
  edit: boolean
  tags: boolean
  precision: boolean
  sources: boolean
}

export type ToolUiLayout = {
  chrome: ToolUiChrome
  /** Ordered page blocks (sections). Always includes `tool` at least once. */
  blocks: PageBlockId[]
  slots: Record<ShellSlotId, SlotSize>
}

const DEFAULT_BLOCKS: PageBlockId[] = ['tool', 'precision', 'sources', 'edit']

const TRUE = new Set(['1', 'true', 'yes', 'on'])
const FALSE = new Set(['0', 'false', 'no', 'off'])

/** localStorage key for last-used layout prefs (cross-tool defaults). */
export const LAYOUT_PREFS_STORAGE_KEY = 'sidus.toolLayout.v1'

function flag(params: URLSearchParams, key: string, defaultOn: boolean): boolean {
  const raw = params.get(key)
  if (raw == null || raw === '') return defaultOn
  const v = raw.toLowerCase()
  if (TRUE.has(v)) return true
  if (FALSE.has(v)) return false
  return defaultOn
}

function slotSize(params: URLSearchParams, key: ShellSlotId, fallback: SlotSize): SlotSize {
  const raw = (params.get(key) ?? '').toLowerCase()
  if (raw === 'full' || raw === 'f' || raw === '1') return 'full'
  if (raw === 'half' || raw === 'h' || raw === '2') return 'half'
  if (raw === 'compact' || raw === 'c' || raw === 'sm') return 'compact'
  if (raw === '0' || raw === 'off' || raw === 'hidden' || raw === 'none') return 'hidden'
  return fallback
}

function parseBlocks(params: URLSearchParams): PageBlockId[] {
  const raw = params.get('blocks')
  if (!raw?.trim()) return [...DEFAULT_BLOCKS]
  const allowed = new Set<PageBlockId>(DEFAULT_BLOCKS)
  const out: PageBlockId[] = []
  for (const part of raw.split(/[,+|]/)) {
    const id = part.trim().toLowerCase() as PageBlockId
    if (allowed.has(id) && !out.includes(id)) out.push(id)
  }
  if (!out.includes('tool')) out.unshift('tool')
  return out.length ? out : [...DEFAULT_BLOCKS]
}

/** Parse layout from current search params (works with useSearchParams). */
export function parseToolUiLayout(params: URLSearchParams): ToolUiLayout {
  const focus = flag(params, 'focus', false) || flag(params, 'chrome', true) === false
  // When focus=1, default chrome pieces off unless explicitly re-enabled with =1
  const chromeDefault = !focus

  return {
    chrome: {
      focus,
      title: flag(params, 'title', chromeDefault),
      subtitle: flag(params, 'subtitle', chromeDefault),
      formula: flag(params, 'formula', chromeDefault),
      back: flag(params, 'back', chromeDefault),
      edit: flag(params, 'edit', chromeDefault),
      tags: flag(params, 'tags', chromeDefault),
      precision: flag(params, 'precision', true),
      sources: flag(params, 'sources', !focus),
    },
    blocks: parseBlocks(params),
    slots: {
      params: slotSize(params, 'params', 'half'),
      results: slotSize(params, 'results', 'half'),
      preview: slotSize(params, 'preview', 'half'),
      code: slotSize(params, 'code', 'half'),
    },
  }
}

/**
 * Flex class for a shell slot given size.
 * half uses basis percentages (not flex-1/basis-0 alone) so a lone half slot
 * in a column still sizes to content height instead of collapsing to 0.
 */
export function slotClass(size: SlotSize): string {
  switch (size) {
    case 'full':
      return 'w-full min-w-0 shrink-0 basis-full'
    case 'compact':
      return 'w-full min-w-0 shrink-0 basis-full sm:basis-[min(100%,22rem)] sm:max-w-md sm:flex-none'
    case 'hidden':
      return 'hidden'
    case 'half':
    default:
      // Side-by-side on lg. flex-none + fixed basis so a tall sibling (e.g. units
      // results list) never collapses the other column or the CODE row below.
      return 'w-full min-w-0 shrink-0 grow-0 basis-full lg:basis-1/2 lg:max-w-[50%]'
  }
}

/** Row: wrap half/compact side-by-side; full always own row. */
export function isFullSlot(size: SlotSize): boolean {
  return size === 'full'
}

/**
 * Full-width content mode: every non-hidden shell slot is `full`.
 * Used to tighten page horizontal padding from marketing `--page-pad-x`
 * to the internal gap rhythm (`--page-gap`) so PARAMETERS / RESULTS / …
 * use the useful width without a content-shell frame.
 *
 * Half / compact keep standard page pad (readable measure).
 */
export function usesTightPagePad(ui: Pick<ToolUiLayout, 'slots'>): boolean {
  const sizes = Object.values(ui.slots).filter((s) => s !== 'hidden')
  return sizes.length > 0 && sizes.every((s) => s === 'full')
}

/**
 * URL keys owned by the layout system (never tool physics).
 * `meta` is a legacy chrome flag (removed `#tag · live` eyebrow); still stripped.
 */
export const LAYOUT_PARAM_KEYS = [
  'focus',
  'chrome',
  'title',
  'subtitle',
  'formula',
  'back',
  'edit',
  'tags',
  'meta',
  'precision',
  'sources',
  'blocks',
  'params',
  'results',
  'preview',
  'code',
] as const

export type LayoutParamKey = (typeof LAYOUT_PARAM_KEYS)[number]

/**
 * Keys that are shareable on a single tool URL but must NOT become
 * cross-tool localStorage defaults. Persisting `focus=1` was hiding the
 * hero (title / description / formula) on every subsequent tool visit.
 */
export const EPHEMERAL_LAYOUT_KEYS = [
  'focus',
  'chrome',
  'title',
  'subtitle',
  'formula',
  'back',
  'edit',
  'tags',
  'meta',
] as const satisfies readonly LayoutParamKey[]

const EPHEMERAL_LAYOUT_KEY_SET = new Set<string>(EPHEMERAL_LAYOUT_KEYS)

/**
 * Named presets. `focus` is the instrument workspace (site chrome off).
 * Former separate `instrument` preset is an alias of `focus` for old URLs.
 */
export type LayoutPresetId = 'default' | 'focus' | 'fullwidth'

export const LAYOUT_PRESETS: Record<
  LayoutPresetId,
  Partial<Record<LayoutParamKey, string>>
> = {
  default: {},
  focus: { focus: '1' },
  fullwidth: {
    params: 'full',
    results: 'full',
    preview: 'full',
    code: 'full',
  },
}

/** True if any layout key is present in the URL. */
export function hasLayoutParams(params: URLSearchParams): boolean {
  return LAYOUT_PARAM_KEYS.some((k) => params.has(k))
}

/**
 * Snapshot layout keys currently set on the URL.
 * By default omits ephemeral chrome/focus keys so they are not written to
 * cross-tool prefs (use `includeEphemeral: true` for full URL snapshots).
 */
export function extractLayoutRecord(
  params: URLSearchParams,
  opts?: { includeEphemeral?: boolean },
): Partial<Record<LayoutParamKey, string>> {
  const out: Partial<Record<LayoutParamKey, string>> = {}
  const includeEphemeral = opts?.includeEphemeral === true
  for (const k of LAYOUT_PARAM_KEYS) {
    if (!includeEphemeral && EPHEMERAL_LAYOUT_KEY_SET.has(k)) continue
    const v = params.get(k)
    if (v != null && v !== '') out[k] = v
  }
  return out
}

function storage(): Storage | null {
  try {
    if (typeof globalThis.localStorage === 'undefined') return null
    return globalThis.localStorage
  } catch {
    return null
  }
}

export function loadLayoutPrefs(): Partial<Record<LayoutParamKey, string>> | null {
  const ls = storage()
  if (!ls) return null
  try {
    const raw = ls.getItem(LAYOUT_PREFS_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
    const out: Partial<Record<LayoutParamKey, string>> = {}
    const allowed = new Set<string>(LAYOUT_PARAM_KEYS)
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (!allowed.has(k)) continue
      // Drop legacy focus/chrome keys that used to hide hero formulas on every tool
      if (EPHEMERAL_LAYOUT_KEY_SET.has(k)) continue
      if (typeof v === 'string' && v !== '') out[k as LayoutParamKey] = v
    }
    return Object.keys(out).length ? out : null
  } catch {
    return null
  }
}

/** Persist current URL layout as the default for other tools. */
export function saveLayoutPrefs(params: URLSearchParams): void {
  const ls = storage()
  if (!ls) return
  try {
    const rec = extractLayoutRecord(params)
    if (Object.keys(rec).length === 0) {
      ls.removeItem(LAYOUT_PREFS_STORAGE_KEY)
    } else {
      ls.setItem(LAYOUT_PREFS_STORAGE_KEY, JSON.stringify(rec))
    }
  } catch {
    /* private mode / quota */
  }
}

export function clearLayoutPrefs(): void {
  const ls = storage()
  if (!ls) return
  try {
    ls.removeItem(LAYOUT_PREFS_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

/**
 * If the URL has no layout keys, merge stored prefs (cross-tool default).
 * Does not override an explicit shareable layout URL.
 */
export function seedLayoutFromPrefs(params: URLSearchParams): URLSearchParams | null {
  if (hasLayoutParams(params)) return null
  const saved = loadLayoutPrefs()
  if (!saved) return null
  return applyLayoutPatch(params, saved)
}

/** Strip all layout keys from a search-params clone. */
export function clearLayoutParams(params: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(params)
  for (const k of LAYOUT_PARAM_KEYS) next.delete(k)
  return next
}

/**
 * Apply a layout patch. `null` value deletes the key (revert to default).
 * Preserves non-layout (physics) params.
 */
export function applyLayoutPatch(
  params: URLSearchParams,
  patch: Partial<Record<LayoutParamKey, string | null>>,
): URLSearchParams {
  const next = new URLSearchParams(params)
  for (const [k, v] of Object.entries(patch) as [LayoutParamKey, string | null][]) {
    if (v == null || v === '') next.delete(k)
    else next.set(k, v)
  }
  return next
}

export function applyLayoutPreset(
  params: URLSearchParams,
  preset: LayoutPresetId,
): URLSearchParams {
  let next = clearLayoutParams(params)
  const spec = LAYOUT_PRESETS[preset]
  for (const [k, v] of Object.entries(spec) as [LayoutParamKey, string][]) {
    next.set(k, v)
  }
  return next
}

/** Exit focus mode only: keep slot sizes / panel toggles. */
export function exitFocusLayout(params: URLSearchParams): URLSearchParams {
  return applyLayoutPatch(params, { focus: null, chrome: null })
}

/** Detect which named preset (if any) matches current params. */
export function matchLayoutPreset(params: URLSearchParams): LayoutPresetId | null {
  for (const id of ['fullwidth', 'focus', 'default'] as LayoutPresetId[]) {
    if (id === 'default') {
      const any = LAYOUT_PARAM_KEYS.some((k) => params.has(k))
      if (!any) return 'default'
      continue
    }
    const spec = LAYOUT_PRESETS[id]
    let ok = true
    for (const [k, v] of Object.entries(spec) as [LayoutParamKey, string][]) {
      if (params.get(k) !== v) {
        ok = false
        break
      }
    }
    // focus: only focus=1 (and legacy chrome=0) with no other layout keys
    if (id === 'focus' && ok) {
      const extra = LAYOUT_PARAM_KEYS.some(
        (k) => k !== 'focus' && k !== 'chrome' && params.has(k),
      )
      if (extra) ok = false
    }
    if (ok) return id
  }
  // Legacy instrument URLs (focus + many chrome flags) → treat as focus when focused
  if (flag(params, 'focus', false)) return null
  return null
}
