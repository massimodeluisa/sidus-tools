import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  applyLayoutPreset,
  clearLayoutParams,
  clearLayoutPrefs,
  exitFocusLayout,
  extractLayoutRecord,
  LAYOUT_PREFS_STORAGE_KEY,
  loadLayoutPrefs,
  matchLayoutPreset,
  parseToolUiLayout,
  saveLayoutPrefs,
  seedLayoutFromPrefs,
  slotClass,
  usesTightPagePad,
} from './toolUiLayout'

describe('parseToolUiLayout', () => {
  it('defaults to non-focus chrome on', () => {
    const ui = parseToolUiLayout(new URLSearchParams())
    expect(ui.chrome.focus).toBe(false)
    expect(ui.chrome.title).toBe(true)
    expect(ui.chrome.back).toBe(true)
    expect(ui.slots.params).toBe('half')
    expect(ui.blocks[0]).toBe('tool')
  })

  it('focus=1 hides chrome defaults (instrument workspace)', () => {
    const ui = parseToolUiLayout(new URLSearchParams('focus=1'))
    expect(ui.chrome.focus).toBe(true)
    expect(ui.chrome.title).toBe(false)
    expect(ui.chrome.back).toBe(false)
    expect(ui.chrome.sources).toBe(false)
    // precision still useful unless off
    expect(ui.chrome.precision).toBe(true)
  })

  it('focus can re-enable title with title=1', () => {
    const ui = parseToolUiLayout(new URLSearchParams('focus=1&title=1'))
    expect(ui.chrome.focus).toBe(true)
    expect(ui.chrome.title).toBe(true)
  })

  it('parses slot sizes and blocks order', () => {
    const ui = parseToolUiLayout(
      new URLSearchParams('params=full&results=compact&code=0&blocks=tool,precision,sources'),
    )
    expect(ui.slots.params).toBe('full')
    expect(ui.slots.results).toBe('compact')
    expect(ui.slots.code).toBe('hidden')
    expect(ui.blocks).toEqual(['tool', 'precision', 'sources'])
  })

  it('slotClass includes min-w-0 for flex children', () => {
    expect(slotClass('half')).toMatch(/min-w-0/)
    expect(slotClass('full')).toMatch(/basis-full/)
  })

  it('usesTightPagePad only when every non-hidden slot is full', () => {
    expect(usesTightPagePad(parseToolUiLayout(new URLSearchParams()))).toBe(false)
    expect(
      usesTightPagePad(parseToolUiLayout(new URLSearchParams('params=full&results=half'))),
    ).toBe(false)
    expect(
      usesTightPagePad(
        parseToolUiLayout(
          new URLSearchParams('params=full&results=full&preview=full&code=full'),
        ),
      ),
    ).toBe(true)
    // hidden slots ignored: remaining all full still tight
    expect(
      usesTightPagePad(
        parseToolUiLayout(
          new URLSearchParams('params=full&results=full&preview=0&code=full'),
        ),
      ),
    ).toBe(true)
  })

  it('presets write focus without wiping physics params', () => {
    const base = new URLSearchParams('body=earth&h=400&hu=km')
    const focus = applyLayoutPreset(base, 'focus')
    expect(focus.get('body')).toBe('earth')
    expect(focus.get('h')).toBe('400')
    expect(focus.get('focus')).toBe('1')
    expect(matchLayoutPreset(focus)).toBe('focus')
  })

  it('exitFocusLayout keeps slots and drops focus', () => {
    const p = new URLSearchParams('focus=1&params=full&body=mars')
    const next = exitFocusLayout(p)
    expect(next.get('focus')).toBeNull()
    expect(next.get('params')).toBe('full')
    expect(next.get('body')).toBe('mars')
  })

  it('clearLayoutParams removes only layout keys', () => {
    const p = new URLSearchParams('focus=1&body=mars&params=full')
    const c = clearLayoutParams(p)
    expect(c.get('body')).toBe('mars')
    expect(c.has('focus')).toBe(false)
    expect(c.has('params')).toBe(false)
  })
})

describe('layout prefs storage', () => {
  const mem = new Map<string, string>()

  beforeEach(() => {
    mem.clear()
    // bun test has no browser localStorage: stub a minimal one
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (k: string) => mem.get(k) ?? null,
        setItem: (k: string, v: string) => {
          mem.set(k, v)
        },
        removeItem: (k: string) => {
          mem.delete(k)
        },
      },
    })
  })

  afterEach(() => {
    clearLayoutPrefs()
  })

  it('save/load round-trip persists slots but not focus chrome', () => {
    const p = new URLSearchParams('focus=1&params=full&body=earth')
    saveLayoutPrefs(p)
    const loaded = loadLayoutPrefs()
    // focus is ephemeral — must not poison every later tool (hides formulas)
    expect(loaded?.focus).toBeUndefined()
    expect(loaded?.params).toBe('full')
    expect(loaded).not.toHaveProperty('body')
    expect(mem.get(LAYOUT_PREFS_STORAGE_KEY)).toBeTruthy()
  })

  it('seedLayoutFromPrefs only when URL has no layout keys', () => {
    saveLayoutPrefs(new URLSearchParams('focus=1&preview=0'))
    const bare = new URLSearchParams('body=earth&h=400')
    const seeded = seedLayoutFromPrefs(bare)
    // focus was saved in URL but stripped from prefs
    expect(seeded?.get('focus')).toBeNull()
    expect(seeded?.get('preview')).toBe('0')
    expect(seeded?.get('body')).toBe('earth')

    const already = new URLSearchParams('focus=1&body=mars')
    expect(seedLayoutFromPrefs(already)).toBeNull()
  })

  it('extractLayoutRecord ignores physics and ephemeral chrome by default', () => {
    const r = extractLayoutRecord(new URLSearchParams('h=1&params=full&focus=1'))
    expect(r).toEqual({ params: 'full' })
    const full = extractLayoutRecord(new URLSearchParams('h=1&params=full&focus=1'), {
      includeEphemeral: true,
    })
    expect(full).toEqual({ params: 'full', focus: '1' })
  })
})
