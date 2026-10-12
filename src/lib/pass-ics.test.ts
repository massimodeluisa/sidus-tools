import { describe, expect, it } from 'vitest'
import { passToIcs } from './pass-ics'

describe('passToIcs', () => {
  it('escapes ICS text and stamps AOS to LOS in UTC', () => {
    const text = passToIcs({
      uid: 'pass-1',
      title: 'ISS, max el 40°',
      description: 'Rises NE; sets SW\nline',
      start: new Date('2026-08-24T01:02:03.000Z'),
      end: new Date('2026-08-24T01:12:03.000Z'),
    })
    expect(text.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
    expect(text.endsWith('END:VCALENDAR\r\n')).toBe(true)
    expect(text).toContain('PRODID:-//sidus.tools//pass-predict//EN')
    expect(text).toContain('DTSTART:20260824T010203Z')
    expect(text).toContain('DTEND:20260824T011203Z')
    expect(text).toContain('SUMMARY:ISS\\, max el 40°')
    expect(text).toContain('DESCRIPTION:Rises NE\\; sets SW\\nline')
  })
})
