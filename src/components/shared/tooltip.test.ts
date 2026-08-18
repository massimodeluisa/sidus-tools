import { describe, expect, it } from 'vitest'
import { mergeDescribedBy, tooltipProps } from './tooltip'

describe('tooltipProps', () => {
  it('omits data-tip when text is empty', () => {
    expect(tooltipProps('  ')).toEqual({ className: undefined })
    expect(tooltipProps(undefined, 'btn')).toEqual({ className: 'btn' })
  })

  it('adds data-tip and sidus-tooltip for visual CSS bubbles', () => {
    const props = tooltipProps('Height above radius.', 'cursor-help')
    expect(props['data-tip']).toBe('Height above radius.')
    expect(props.className).toContain('sidus-tooltip')
    expect(props.className).toContain('cursor-help')
  })

  it('adds placement modifier classes', () => {
    const props = tooltipProps('Copy link', 'btn', 'below-end')
    expect(props.className).toContain('sidus-tooltip-below')
    expect(props.className).toContain('sidus-tooltip-end')
    expect(props.className).toContain('btn')
  })
})

describe('mergeDescribedBy', () => {
  it('joins and de-duplicates ids', () => {
    expect(mergeDescribedBy('a b', 'b')).toBe('a b')
    expect(mergeDescribedBy(undefined, 'tip')).toBe('tip')
    expect(mergeDescribedBy('hint', undefined)).toBe('hint')
  })
})
