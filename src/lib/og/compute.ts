/**
 * Resolve OG payload from page/tool + URL search params.
 * Pure SI compute reuses lib/physics: safe for Node serverless & tests.
 */
import { TOOLS, getTool } from '../../data/tools'
import { EARTH_MU, EARTH_RADIUS } from '../physics/constants'
import {
  apsidesWithSpeeds,
  biellipticTransfer,
  circularOrbitVelocity,
  escapeVelocity,
  hohmannTransfer,
  localGravity,
  multiStageDeltaV,
  orbitalPeriod,
  planeChangeDeltaV,
  rocketDeltaV,
  specificEnergyCircular,
  visViva,
} from '../physics/orbital'
import { getBody } from '../physics/bodies'
import { isaAtmosphere, dynamicPressure } from '../physics/atmosphere'
import { j2ArgpRate, j2RaanRate } from '../physics/j2'
import { earthRotationBoost, launchAzimuth } from '../physics/launch'
import { ssoInclination } from '../physics/sso'
import { linkBudget } from '../physics/link'
import { phasingOrbit } from '../physics/phasing'
import {
  cabinFromMasses,
  cabinMassesFromComposition,
  coolantMassFlow,
  leakDepressTime,
  liohDuration,
  metabolicBudget,
  type MetabolicActivity,
} from '../physics/eclss'
import { toSi } from '../physics/units'
import { toolOgMeta } from './catalog'
import type { OgMetric, OgPayload } from './types'
import { SITE_ORIGIN } from './types'
import { LAYOUT_PARAM_KEYS } from '../toolUiLayout'

/** Layout/chrome URL keys never belong on /api/og (live formula image). */
const OG_STRIP = new Set<string>([...LAYOUT_PARAM_KEYS, 'mcp', 'tool', 'page'])

function num(q: Record<string, string | undefined>, key: string, fallback: number): number {
  const raw = q[key]
  if (raw == null || raw === '') return fallback
  const n = Number(raw)
  return Number.isFinite(n) ? n : fallback
}

function str(q: Record<string, string | undefined>, key: string, fallback: string): string {
  const raw = q[key]
  return raw != null && raw !== '' ? raw : fallback
}

function hasAny(q: Record<string, string | undefined>, keys: string[]): boolean {
  return keys.some((k) => q[k] != null && q[k] !== '')
}

/** Locale-stable number for OG cards (crawlers / PNG text). */
function ogNum(n: number, digits = 3): string {
  if (!Number.isFinite(n)) return ': '
  if (Math.abs(n) === 0) return '0'
  const abs = Math.abs(n)
  if (abs >= 1e6 || (abs > 0 && abs < 1e-3)) return n.toExponential(digits)
  // Integers: no decimal strip that would turn 200 → 2
  if (digits <= 0 || Number.isInteger(n)) return String(Math.round(n))
  const fixed = n.toFixed(digits)
  // Only trim fractional trailing zeros: "7.670" → "7.67"
  return fixed.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')
}

function fmtV(ms: number): string {
  if (!Number.isFinite(ms)) return ': '
  if (Math.abs(ms) >= 1000) return ogNum(ms / 1000, 3)
  return ogNum(ms, 2)
}

function vUnit(ms: number): string {
  return Math.abs(ms) >= 1000 ? 'km/s' : 'm/s'
}

function fmtDur(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return ': '
  if (seconds < 60) return `${ogNum(seconds, 1)} s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min`
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return `${h} h ${m} m`
  }
  return `${ogNum(seconds / 86400, 2)} d`
}

/** Build query record from URLSearchParams or plain object */
export function queryFromSearch(
  search: string | URLSearchParams | Record<string, string | string[] | undefined>,
): Record<string, string | undefined> {
  if (typeof search === 'string') {
    return queryFromSearch(new URLSearchParams(search.startsWith('?') ? search : `?${search}`))
  }
  if (search instanceof URLSearchParams) {
    const out: Record<string, string | undefined> = {}
    search.forEach((v, k) => {
      out[k] = v
    })
    return out
  }
  const out: Record<string, string | undefined> = {}
  for (const [k, v] of Object.entries(search)) {
    if (Array.isArray(v)) out[k] = v[0]
    else if (v != null) out[k] = String(v)
  }
  return out
}

function baseTool(toolId: string): OgPayload {
  const tool = getTool(toolId)
  const meta = toolOgMeta(toolId)
  return {
    kind: 'tool',
    toolId,
    title: tool?.title ?? toolId,
    subtitle: meta.blurb,
    formula: meta.formula,
    category: tool?.category ?? tool?.tags?.[0],
    tags: tool?.tags?.slice(0, 4),
    brand: 'SIDUS',
    urlHint: 'sidus.tools',
    dynamic: false,
  }
}

function attach(
  base: OgPayload,
  metrics: OgMetric[],
  context: string,
): OgPayload {
  if (!metrics.length) return base
  return { ...base, metrics: metrics.slice(0, 4), context, dynamic: true }
}

/** Compute metrics for a tool given URL-like params. */
export function computeToolOg(
  toolId: string,
  q: Record<string, string | undefined>,
): OgPayload {
  const base = baseTool(toolId)

  try {
    switch (toolId) {
      case 'circular-orbit': {
        if (!hasAny(q, ['h', 'body', 'hu'])) return base
        const body = getBody(str(q, 'body', 'earth'))
        const hu = str(q, 'hu', 'km')
        const h = toSi(num(q, 'h', 400), hu)
        const r = body.radius + h
        if (!(r > body.radius * 0.5)) return base
        const v = circularOrbitVelocity(body.mu, r)
        const T = orbitalPeriod(body.mu, r)
        const g = localGravity(body.mu, r)
        return attach(
          base,
          [
            { label: 'Velocity', value: fmtV(v), unit: vUnit(v) },
            { label: 'Period', value: fmtDur(T) },
            { label: 'Local g', value: ogNum(g, 3), unit: 'm/s²' },
            {
              label: 'Energy',
              value: ogNum(specificEnergyCircular(body.mu, r) / 1e6, 2),
              unit: 'MJ/kg',
            },
          ],
          `h = ${ogNum(h / 1000, 1)} km · ${body.name}`,
        )
      }
      case 'hohmann': {
        if (!hasAny(q, ['h1', 'h2', 'body'])) return base
        const body = getBody(str(q, 'body', 'earth'))
        const hu = str(q, 'hu', 'km')
        const h1 = toSi(num(q, 'h1', 200), hu)
        const h2 = toSi(num(q, 'h2', 35786), hu)
        const r1 = body.radius + h1
        const r2 = body.radius + h2
        if (r1 === r2 || r1 <= 0 || r2 <= 0) return base
        const res = hohmannTransfer(body.mu, r1, r2)
        return attach(
          base,
          [
            { label: 'Δv total', value: fmtV(res.dvTotal), unit: vUnit(res.dvTotal) },
            { label: 'Δv₁', value: fmtV(res.dv1), unit: vUnit(res.dv1) },
            { label: 'Δv₂', value: fmtV(res.dv2), unit: vUnit(res.dv2) },
            { label: 'TOF', value: fmtDur(res.tof) },
          ],
          `h₁ ${ogNum(h1 / 1000, 0)} → h₂ ${ogNum(h2 / 1000, 0)} km · ${body.name}`,
        )
      }
      case 'escape': {
        if (!hasAny(q, ['h', 'body'])) return base
        const body = getBody(str(q, 'body', 'earth'))
        const hu = str(q, 'hu', 'km')
        const h = toSi(num(q, 'h', 0), hu)
        const r = body.radius + h
        const vesc = escapeVelocity(body.mu, r)
        const vcirc = circularOrbitVelocity(body.mu, r)
        return attach(
          base,
          [
            { label: 'v_esc', value: fmtV(vesc), unit: vUnit(vesc) },
            { label: 'v_circ', value: fmtV(vcirc), unit: vUnit(vcirc) },
            { label: 'Ratio', value: ogNum(vesc / vcirc, 3), unit: '√2' },
          ],
          `h = ${ogNum(h / 1000, 1)} km · ${body.name}`,
        )
      }
      case 'bielliptic': {
        if (!hasAny(q, ['h1', 'h2', 'hb'])) return base
        const body = getBody(str(q, 'body', 'earth'))
        const hu = str(q, 'hu', 'km')
        const h1 = toSi(num(q, 'h1', 200), hu)
        const h2 = toSi(num(q, 'h2', 100000), hu)
        const hb = toSi(num(q, 'hb', 400000), hu)
        const r1 = body.radius + h1
        const r2 = body.radius + h2
        const rb = body.radius + hb
        const res = biellipticTransfer(body.mu, r1, r2, rb)
        return attach(
          base,
          [
            { label: 'Δv total', value: fmtV(res.dvTotal), unit: vUnit(res.dvTotal) },
            { label: 'TOF', value: fmtDur(res.tof) },
            { label: 'Δv₁', value: fmtV(res.dv1), unit: vUnit(res.dv1) },
            { label: 'Δv₃', value: fmtV(res.dv3), unit: vUnit(res.dv3) },
          ],
          `r_b @ ${ogNum(hb / 1000, 0)} km · ${body.name}`,
        )
      }
      case 'plane-change': {
        if (!hasAny(q, ['v', 'di', 'h', 'mode'])) return base
        const mode = str(q, 'mode', 'altitude')
        let v = num(q, 'v', 7.67)
        const vu = str(q, 'vu', 'kmps')
        if (mode === 'altitude' || q.h != null) {
          const body = getBody(str(q, 'body', 'earth'))
          const hu = str(q, 'hu', 'km')
          const h = toSi(num(q, 'h', 400), hu)
          v = circularOrbitVelocity(body.mu, body.radius + h)
        } else if (vu === 'kmps' || vu === 'km/s' || vu === 'kms') {
          v = toSi(v, 'kmps')
        } else {
          v = toSi(v, vu === 'mps' ? 'mps' : 'kmps')
        }
        const di = num(q, 'di', 28.5)
        const dv = planeChangeDeltaV(v, (di * Math.PI) / 180)
        return attach(
          base,
          [
            { label: 'Δv', value: fmtV(dv), unit: vUnit(dv) },
            { label: 'Δi', value: ogNum(di, 2), unit: 'deg' },
            { label: 'v', value: fmtV(v), unit: vUnit(v) },
          ],
          `plane change Δi = ${ogNum(di, 1)}°`,
        )
      }
      case 'vis-viva': {
        if (!hasAny(q, ['r', 'a'])) return base
        const body = getBody(str(q, 'body', 'earth'))
        const lu = str(q, 'lu', 'km')
        const r = toSi(num(q, 'r', 6778), lu)
        const a = toSi(num(q, 'a', 6778), lu)
        if (!(r > 0) || !(a > 0) || 2 / r - 1 / a < 0) return base
        const v = visViva(body.mu, r, a)
        return attach(
          base,
          [
            { label: 'v', value: fmtV(v), unit: vUnit(v) },
            { label: 'r', value: ogNum(r / 1000, 1), unit: 'km' },
            { label: 'a', value: ogNum(a / 1000, 1), unit: 'km' },
          ],
          `${body.name} · vis-viva`,
        )
      }
      case 'apsides': {
        if (!hasAny(q, ['a', 'e'])) return base
        const body = getBody(str(q, 'body', 'earth'))
        const lu = str(q, 'lu', 'km')
        const a = toSi(num(q, 'a', 7000), lu)
        const e = num(q, 'e', 0.1)
        const res = apsidesWithSpeeds(body.mu, a, e)
        if (!res) return base
        return attach(
          base,
          [
            { label: 'r_p', value: ogNum(res.rp / 1000, 1), unit: 'km' },
            { label: 'r_a', value: ogNum(res.ra / 1000, 1), unit: 'km' },
            { label: 'v_p', value: fmtV(res.vp), unit: vUnit(res.vp) },
            { label: 'v_a', value: fmtV(res.va), unit: vUnit(res.va) },
          ],
          `a = ${ogNum(a / 1000, 0)} km · e = ${ogNum(e, 3)}`,
        )
      }
      case 'rocket-equation': {
        if (!hasAny(q, ['isp', 'm0', 'mf'])) return base
        const isp = num(q, 'isp', 330)
        const mu = str(q, 'mu', 'kg')
        const m0 = toSi(num(q, 'm0', 500_000), mu)
        const mf = toSi(num(q, 'mf', 100_000), mu)
        const dv = rocketDeltaV(isp, m0, mf)
        if (!Number.isFinite(dv)) return base
        return attach(
          base,
          [
            { label: 'Δv', value: fmtV(dv), unit: vUnit(dv) },
            { label: 'I_sp', value: ogNum(isp, 0), unit: 's' },
            { label: 'm₀/m_f', value: ogNum(m0 / mf, 2) },
          ],
          `Tsiolkovsky · mass ratio ${ogNum(m0 / mf, 2)}`,
        )
      }
      case 'multi-stage': {
        // stages encoded as ve1,m01,mf1,... or simple defaults
        if (!hasAny(q, ['ve1', 'm01', 'mf1', 'n'])) return base
        const stages = []
        for (let i = 1; i <= 5; i++) {
          if (q[`ve${i}`] == null) break
          stages.push({
            ve: num(q, `ve${i}`, 3000),
            m0: num(q, `m0${i}`, 100000),
            mf: num(q, `mf${i}`, 20000),
          })
        }
        if (!stages.length) return base
        const res = multiStageDeltaV(stages)
        if (!res) return base
        return attach(
          base,
          [
            { label: 'Δv total', value: fmtV(res.dvTotal), unit: vUnit(res.dvTotal) },
            { label: 'Stages', value: String(stages.length) },
          ],
          `${stages.length}-stage ideal stack`,
        )
      }
      case 'j2-drift': {
        if (!hasAny(q, ['a', 'i', 'e', 'h'])) return base
        const lu = str(q, 'lu', 'km')
        let a = q.a != null ? toSi(num(q, 'a', 7000), lu) : EARTH_RADIUS + toSi(num(q, 'h', 700), 'km')
        const e = num(q, 'e', 0)
        const i = (num(q, 'i', 98) * Math.PI) / 180
        const raan = j2RaanRate(EARTH_MU, a, e, i)
        const argp = j2ArgpRate(EARTH_MU, a, e, i)
        if (raan == null || argp == null) return base
        return attach(
          base,
          [
            {
              label: 'Ω̇',
              value: ogNum((raan * 180) / Math.PI * 86400, 3),
              unit: '°/day',
            },
            {
              label: 'ω̇',
              value: ogNum((argp * 180) / Math.PI * 86400, 3),
              unit: '°/day',
            },
            { label: 'i', value: ogNum(num(q, 'i', 98), 1), unit: 'deg' },
          ],
          `a = ${ogNum(a / 1000, 0)} km · J₂ Earth`,
        )
      }
      case 'launch-azimuth': {
        if (!hasAny(q, ['lat', 'i'])) return base
        const lat = (num(q, 'lat', 28.5) * Math.PI) / 180
        const i = (num(q, 'i', 51.6) * Math.PI) / 180
        const az = launchAzimuth(lat, i)
        if (!az) return base
        const boost = earthRotationBoost(lat, EARTH_RADIUS)
        return attach(
          base,
          [
            { label: 'Azimuth', value: ogNum(az.azimuthDeg, 2), unit: 'deg' },
            { label: 'Alt. az', value: ogNum(az.complementaryDeg, 2), unit: 'deg' },
            { label: 'v_rot', value: ogNum(boost, 1), unit: 'm/s' },
          ],
          `φ = ${ogNum(num(q, 'lat', 28.5), 1)}° · i = ${ogNum(num(q, 'i', 51.6), 1)}°`,
        )
      }
      case 'sso': {
        if (!hasAny(q, ['h', 'a'])) return base
        const hu = str(q, 'hu', 'km')
        const a =
          q.a != null
            ? toSi(num(q, 'a', 7000), hu)
            : EARTH_RADIUS + toSi(num(q, 'h', 700), hu)
        const i = ssoInclination(a)
        if (i == null) return base
        return attach(
          base,
          [
            { label: 'i_SSO', value: ogNum((i * 180) / Math.PI, 3), unit: 'deg' },
            { label: 'Altitude', value: ogNum((a - EARTH_RADIUS) / 1000, 0), unit: 'km' },
            { label: 'Period', value: fmtDur(orbitalPeriod(EARTH_MU, a)) },
          ],
          `circular SSO · Earth J₂`,
        )
      }
      case 'dynamic-pressure': {
        if (!hasAny(q, ['h', 'v'])) return base
        const hu = str(q, 'hu', 'km')
        const vu = str(q, 'vu', 'mps')
        const h = toSi(num(q, 'h', 10), hu)
        let v = num(q, 'v', 500)
        if (vu === 'kmps' || vu === 'km/s') v *= 1000
        const atm = isaAtmosphere(h)
        if (!atm) return base
        const qdyn = dynamicPressure(atm.rho, v)
        const mach = v / atm.a
        return attach(
          base,
          [
            { label: 'q', value: ogNum(qdyn / 1000, 2), unit: 'kPa' },
            { label: 'Mach', value: ogNum(mach, 2) },
            { label: 'ρ', value: ogNum(atm.rho, 3), unit: 'kg/m³' },
            { label: 'T', value: ogNum(atm.T, 1), unit: 'K' },
          ],
          `ISA · h = ${ogNum(h / 1000, 1)} km`,
        )
      }
      case 'link-budget': {
        if (!hasAny(q, ['pt', 'freq', 'range', 'ptW', 'freqHz', 'rangeM'])) {
          // accept either naming
        }
        const ptW = num(q, 'ptW', num(q, 'pt', 10))
        const gt = num(q, 'gtDbi', num(q, 'gt', 0))
        const gr = num(q, 'grDbi', num(q, 'gr', 30))
        const freqHz = num(q, 'freqHz', num(q, 'freq', 12e9))
        const rangeM = num(q, 'rangeM', num(q, 'range', 1000e3))
        if (!hasAny(q, ['pt', 'ptW', 'freq', 'freqHz', 'range', 'rangeM'])) return base
        const res = linkBudget({
          ptW,
          gtDbi: gt,
          grDbi: gr,
          freqHz,
          rangeM,
          otherLossDb: num(q, 'loss', 0),
          tSysK: num(q, 'tsys', 290),
          requiredCn0DbHz: q.req != null ? num(q, 'req', 50) : undefined,
        })
        if (!res) return base
        return attach(
          base,
          [
            { label: 'EIRP', value: ogNum(res.eirpDbw, 1), unit: 'dBW' },
            { label: 'FSPL', value: ogNum(res.lfsDb, 1), unit: 'dB' },
            { label: 'P_r', value: ogNum(res.prDbw, 1), unit: 'dBW' },
            {
              label: 'C/N₀',
              value: res.cn0DbHz != null ? ogNum(res.cn0DbHz, 1) : ': ',
              unit: 'dB-Hz',
            },
          ],
          `${ogNum(freqHz / 1e9, 2)} GHz · ${ogNum(rangeM / 1000, 0)} km`,
        )
      }
      case 'phasing': {
        if (!hasAny(q, ['h', 'phase', 'n'])) return base
        const body = getBody(str(q, 'body', 'earth'))
        const hu = str(q, 'hu', 'km')
        const h = toSi(num(q, 'h', 400), hu)
        const r = body.radius + h
        const phase = (num(q, 'phase', 30) * Math.PI) / 180
        const nRevs = num(q, 'n', 1)
        const res = phasingOrbit(body.mu, r, phase, nRevs)
        if (!res) return base
        return attach(
          base,
          [
            { label: 'Δv total', value: fmtV(res.dvTotal), unit: vUnit(res.dvTotal) },
            { label: 'a_phase', value: ogNum(res.aPhase / 1000, 1), unit: 'km' },
            { label: 'T_phase', value: fmtDur(res.tPhase) },
          ],
          `δθ = ${ogNum(num(q, 'phase', 30), 1)}° · N = ${nRevs}`,
        )
      }
      case 'metabolic-load': {
        if (!hasAny(q, ['activity', 'crew', 'hours'])) return base
        const activity = str(q, 'activity', 'nominal') as MetabolicActivity
        const crew = num(q, 'crew', 1)
        const hours = num(q, 'hours', 24)
        const res = metabolicBudget(activity, hours * 3600, crew)
        if (!res) return base
        return attach(
          base,
          [
            { label: 'O₂', value: ogNum(res.o2Kg, 3), unit: 'kg' },
            { label: 'CO₂', value: ogNum(res.co2Kg, 3), unit: 'kg' },
            { label: 'Heat', value: ogNum(res.heatAvgW, 0), unit: 'W' },
            { label: 'H₂O', value: ogNum(res.h2oKg, 3), unit: 'kg' },
          ],
          `${activity} · ${crew} crew · ${hours} h`,
        )
      }
      case 'cabin-atmosphere': {
        if (!hasAny(q, ['V', 'T', 'P', 'xO2'])) return base
        const V = num(q, 'V', 100)
        const T = num(q, 'T', 293)
        const P = num(q, 'P', 101325)
        const xO2 = num(q, 'xO2', 0.21)
        const ppCO2 = num(q, 'ppCO2', 400)
        const masses = cabinMassesFromComposition(V, T, P, xO2, ppCO2, num(q, 'rh', 0.4))
        if (!masses) return base
        const atm = cabinFromMasses(V, T, masses)
        if (!atm) return base
        return attach(
          base,
          [
            {
              label: 'ppO₂',
              value: ogNum(atm.ppO2Pa / 133.322, 1),
              unit: 'mmHg',
            },
            {
              label: 'ppCO₂',
              value: ogNum(atm.ppCO2Pa / 133.322, 2),
              unit: 'mmHg',
            },
            { label: 'P', value: ogNum(atm.pTotalPa / 1000, 1), unit: 'kPa' },
          ],
          `V = ${ogNum(V, 0)} m³ · cabin ideal gas`,
        )
      }
      case 'lioh-scrubber': {
        if (!hasAny(q, ['lioh', 'rate', 'co2'])) return base
        const m = num(q, 'lioh', 2)
        // rate kg/s or kg/h
        let rate = num(q, 'rate', num(q, 'co2', 1.04 / 86400))
        if (rate > 0.001) rate = rate / 3600 // treat as kg/h if large
        const res = liohDuration(m, rate)
        if (!res) return base
        return attach(
          base,
          [
            { label: 'Duration', value: ogNum(res.durationS / 3600, 1), unit: 'h' },
            { label: 'Capacity', value: ogNum(res.capacityKg, 2), unit: 'kg CO₂' },
            { label: 'LiOH', value: ogNum(m, 2), unit: 'kg' },
          ],
          'non-regenerative CO₂ scrubbing',
        )
      }
      case 'cabin-leak': {
        if (!hasAny(q, ['V', 'A', 'P0', 'P1'])) return base
        const V = num(q, 'V', 10)
        const A = num(q, 'A', 1e-4)
        const P0 = num(q, 'P0', 101325)
        const P1 = num(q, 'P1', 50000)
        const t = leakDepressTime(V, A, P0, P1)
        if (t == null) return base
        return attach(
          base,
          [
            { label: 'Time', value: fmtDur(t) },
            { label: 'P₀→P₁', value: `${ogNum(P0 / 1000, 0)}→${ogNum(P1 / 1000, 0)}`, unit: 'kPa' },
          ],
          `orifice A = ${A.toExponential(1)} m²`,
        )
      }
      case 'thermal-loop': {
        if (!hasAny(q, ['Q', 'dT', 'cp'])) return base
        const Q = num(q, 'Q', 2000)
        const dT = num(q, 'dT', 10)
        const cp = num(q, 'cp', 4184)
        const mdot = coolantMassFlow(Q, dT, cp)
        if (mdot == null) return base
        return attach(
          base,
          [
            { label: 'ṁ', value: ogNum(mdot, 3), unit: 'kg/s' },
            { label: 'Q̇', value: ogNum(Q, 0), unit: 'W' },
            { label: 'ΔT', value: ogNum(dT, 1), unit: 'K' },
          ],
          `c_p = ${ogNum(cp, 0)} J/(kg·K)`,
        )
      }
      case 'bodies': {
        if (!hasAny(q, ['body', 'id'])) return base
        const body = getBody(str(q, 'body', str(q, 'id', 'earth')))
        return attach(
          base,
          [
            { label: 'μ', value: body.mu.toExponential(4), unit: 'm³/s²' },
            { label: 'R', value: ogNum(body.radius / 1000, 1), unit: 'km' },
            { label: 'M', value: body.mass.toExponential(3), unit: 'kg' },
          ],
          body.name,
        )
      }
      default:
        return base
    }
  } catch {
    return base
  }
}

export function resolveOgPayload(
  q: Record<string, string | undefined>,
): OgPayload {
  const page = str(q, 'page', '')
  const tool = str(q, 'tool', str(q, 'id', ''))

  if (page === 'home' || (!page && !tool)) {
    return {
      kind: 'home',
      title: 'SIDUS',
      subtitle: 'Space Engineering Tools',
      formula: 'Pure SI · orbits · propulsion · ECLSS · RF',
      tags: ['open source', 'educational', `${TOOLS.length} tools`],
      metrics: [
        { label: 'Live tools', value: String(TOOLS.length) },
        { label: 'Categories', value: '5' },
        { label: 'Units', value: 'SI' },
        { label: 'License', value: 'MIT' },
      ],
      context: 'Browser-local math. No affiliation with NASA, ESA, or SpaceX',
      brand: 'SIDUS',
      urlHint: SITE_ORIGIN.replace('https://', ''),
      dynamic: false,
    }
  }

  if (page === 'tools') {
    return {
      kind: 'tools',
      title: 'Tool catalog',
      subtitle: `${TOOLS.length} pure-SI calculators`,
      formula: 'Orbital · Propulsion · Satellite · Crew · Utilities',
      brand: 'SIDUS',
      urlHint: 'sidus.tools/tools',
      tags: [...new Set(TOOLS.flatMap((t) => t.tags))].slice(0, 24),
    }
  }

  if (page === 'resources') {
    return {
      kind: 'resources',
      title: 'Resources',
      subtitle: 'Textbooks, TLE catalogs, open data',
      formula: 'Vallado · Curtis · NASA GRC · OCHMO · CelesTrak',
      brand: 'SIDUS',
      urlHint: 'sidus.tools/resources',
    }
  }

  if (tool) {
    return computeToolOg(tool, q)
  }

  return resolveOgPayload({ page: 'home' })
}

/** Absolute og:image URL for a path + search string */
export function buildOgImageUrl(
  path: string,
  search?: string | URLSearchParams,
  origin = SITE_ORIGIN,
): string {
  const u = new URL('/api/og', origin)
  if (path === '/' || path === '') {
    u.searchParams.set('page', 'home')
  } else if (path === '/tools') {
    u.searchParams.set('page', 'tools')
  } else if (path === '/resources') {
    u.searchParams.set('page', 'resources')
  } else {
    const m = path.match(/^\/tools\/([^/?#]+)/)
    if (m) {
      u.searchParams.set('tool', m[1])
      const q = queryFromSearch(search ?? '')
      for (const [k, v] of Object.entries(q)) {
        if (v == null || OG_STRIP.has(k)) continue
        u.searchParams.set(k, v)
      }
    } else {
      u.searchParams.set('page', 'home')
    }
  }
  // Bust social-scraper caches after OG pipeline fixes
  if (!u.searchParams.has('v')) u.searchParams.set('v', '3')
  return u.toString()
}
