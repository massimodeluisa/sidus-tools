/**
 * Pure unit conversion: SI bases:
 * length m · velocity m/s · accel m/s² · mass kg · time s · angle rad
 * pressure Pa · area m² · volume m³ · temperature K (offset-aware) · energy J · power W
 * force N · massFlow kg/s · density kg/m³ · specificEnergy J/kg · impulse N·s · frequency Hz
 * heatFlux W/m²
 */

export type UnitCategory =
  | 'length'
  | 'velocity'
  | 'accel'
  | 'mass'
  | 'time'
  | 'angle'
  | 'pressure'
  | 'area'
  | 'volume'
  | 'temperature'
  | 'energy'
  | 'power'
  | 'force'
  | 'massFlow'
  | 'density'
  | 'specificEnergy'
  | 'impulse'
  | 'frequency'
  | 'heatFlux'

export type UnitDef = {
  id: string
  /** Full label for lists */
  label: string
  /** Compact badge (select trigger) */
  short: string
  /**
   * Multiply by toBase → SI base for the category (linear scale).
   * For temperature, toBase is unused for °C/°F: see `fromSi` / `toSi`.
   */
  toBase: number
  category: UnitCategory
  /** Affine offset: SI = value * toBase + offset (temperature). */
  offset?: number
}

export const UNIT_DEFS: UnitDef[] = [
  { id: 'm', label: 'metre (m)', short: 'm', toBase: 1, category: 'length' },
  { id: 'km', label: 'kilometre (km)', short: 'km', toBase: 1000, category: 'length' },
  { id: 'nm', label: 'nanometre (nm)', short: 'nm', toBase: 1e-9, category: 'length' },
  { id: 'um', label: 'micrometre (µm)', short: 'µm', toBase: 1e-6, category: 'length' },
  { id: 'mm', label: 'millimetre (mm)', short: 'mm', toBase: 0.001, category: 'length' },
  { id: 'cm', label: 'centimetre (cm)', short: 'cm', toBase: 0.01, category: 'length' },
  { id: 'au', label: 'astronomical unit (AU)', short: 'AU', toBase: 149_597_870_700, category: 'length' },
  { id: 'ly', label: 'light-year (ly)', short: 'ly', toBase: 9.4607304725808e15, category: 'length' },
  { id: 'pc', label: 'parsec (pc)', short: 'pc', toBase: 3.085677581491367e16, category: 'length' },
  { id: 'mi', label: 'mile (mi)', short: 'mi', toBase: 1609.344, category: 'length' },
  { id: 'nmi', label: 'nautical mile (nmi)', short: 'nmi', toBase: 1852, category: 'length' },

  { id: 'mps', label: 'metre / second (m/s)', short: 'm/s', toBase: 1, category: 'velocity' },
  { id: 'kmps', label: 'kilometre / second (km/s)', short: 'km/s', toBase: 1000, category: 'velocity' },
  { id: 'kmph', label: 'kilometre / hour (km/h)', short: 'km/h', toBase: 1000 / 3600, category: 'velocity' },
  { id: 'mph', label: 'mile / hour (mph)', short: 'mph', toBase: 0.44704, category: 'velocity' },
  { id: 'c', label: 'fraction of c', short: 'c', toBase: 299_792_458, category: 'velocity' },

  { id: 'mps2', label: 'm/s²', short: 'm/s²', toBase: 1, category: 'accel' },
  { id: 'g', label: 'standard gravity g₀', short: 'g₀', toBase: 9.80665, category: 'accel' },

  { id: 'kg', label: 'kilogram (kg)', short: 'kg', toBase: 1, category: 'mass' },
  { id: 'g_mass', label: 'gram (g)', short: 'g', toBase: 0.001, category: 'mass' },
  { id: 't', label: 'tonne (t)', short: 't', toBase: 1000, category: 'mass' },
  { id: 'lb', label: 'pound (lb)', short: 'lb', toBase: 0.45359237, category: 'mass' },

  { id: 's', label: 'second (s)', short: 's', toBase: 1, category: 'time' },
  { id: 'ms', label: 'millisecond (ms)', short: 'ms', toBase: 0.001, category: 'time' },
  { id: 'min', label: 'minute (min)', short: 'min', toBase: 60, category: 'time' },
  { id: 'h', label: 'hour (h)', short: 'h', toBase: 3600, category: 'time' },
  { id: 'd', label: 'day (d)', short: 'd', toBase: 86400, category: 'time' },
  { id: 'yr', label: 'year (365.25 d)', short: 'yr', toBase: 365.25 * 86400, category: 'time' },

  /** Angle base = radian */
  { id: 'rad', label: 'radian (rad)', short: 'rad', toBase: 1, category: 'angle' },
  { id: 'deg', label: 'degree (°)', short: 'deg', toBase: Math.PI / 180, category: 'angle' },
  { id: 'arcmin', label: 'arcminute', short: '′', toBase: Math.PI / 180 / 60, category: 'angle' },
  { id: 'arcsec', label: 'arcsecond', short: '″', toBase: Math.PI / 180 / 3600, category: 'angle' },
  { id: 'mrad', label: 'milliradian', short: 'mrad', toBase: 0.001, category: 'angle' },

  { id: 'Pa', label: 'pascal (Pa)', short: 'Pa', toBase: 1, category: 'pressure' },
  { id: 'kPa', label: 'kilopascal (kPa)', short: 'kPa', toBase: 1000, category: 'pressure' },
  { id: 'bar', label: 'bar', short: 'bar', toBase: 1e5, category: 'pressure' },
  { id: 'atm', label: 'standard atmosphere', short: 'atm', toBase: 101_325, category: 'pressure' },
  { id: 'psi', label: 'pound / inch²', short: 'psi', toBase: 6894.757293168, category: 'pressure' },
  { id: 'mmHg', label: 'millimetre of mercury (mmHg)', short: 'mmHg', toBase: 133.322387415, category: 'pressure' },

  { id: 'm2', label: 'square metre (m²)', short: 'm²', toBase: 1, category: 'area' },
  { id: 'cm2', label: 'square centimetre (cm²)', short: 'cm²', toBase: 1e-4, category: 'area' },
  { id: 'mm2', label: 'square millimetre (mm²)', short: 'mm²', toBase: 1e-6, category: 'area' },
  { id: 'km2', label: 'square kilometre (km²)', short: 'km²', toBase: 1e6, category: 'area' },

  { id: 'm3', label: 'cubic metre (m³)', short: 'm³', toBase: 1, category: 'volume' },
  { id: 'L', label: 'litre (L)', short: 'L', toBase: 0.001, category: 'volume' },
  { id: 'cm3', label: 'cubic centimetre (cm³)', short: 'cm³', toBase: 1e-6, category: 'volume' },

  /** Temperature: SI base = kelvin. °C / °F use offset. */
  { id: 'K', label: 'kelvin (K)', short: 'K', toBase: 1, offset: 0, category: 'temperature' },
  { id: 'C', label: 'degree Celsius (°C)', short: '°C', toBase: 1, offset: 273.15, category: 'temperature' },
  { id: 'F', label: 'degree Fahrenheit (°F)', short: '°F', toBase: 5 / 9, offset: 255.3722222222222, category: 'temperature' },

  { id: 'J', label: 'joule (J)', short: 'J', toBase: 1, category: 'energy' },
  { id: 'kJ', label: 'kilojoule (kJ)', short: 'kJ', toBase: 1000, category: 'energy' },
  { id: 'MJ', label: 'megajoule (MJ)', short: 'MJ', toBase: 1e6, category: 'energy' },
  { id: 'Wh', label: 'watt-hour (Wh)', short: 'Wh', toBase: 3600, category: 'energy' },
  { id: 'kWh', label: 'kilowatt-hour (kWh)', short: 'kWh', toBase: 3.6e6, category: 'energy' },

  { id: 'W', label: 'watt (W)', short: 'W', toBase: 1, category: 'power' },
  { id: 'kW', label: 'kilowatt (kW)', short: 'kW', toBase: 1000, category: 'power' },
  { id: 'MW', label: 'megawatt (MW)', short: 'MW', toBase: 1e6, category: 'power' },

  { id: 'N', label: 'newton (N)', short: 'N', toBase: 1, category: 'force' },
  { id: 'kN', label: 'kilonewton (kN)', short: 'kN', toBase: 1000, category: 'force' },
  { id: 'lbf', label: 'pound-force (lbf)', short: 'lbf', toBase: 4.4482216152605, category: 'force' },

  { id: 'kgps', label: 'kilogram / second (kg/s)', short: 'kg/s', toBase: 1, category: 'massFlow' },
  { id: 'gps', label: 'gram / second (g/s)', short: 'g/s', toBase: 0.001, category: 'massFlow' },
  { id: 'kgpd', label: 'kilogram / day (kg/d)', short: 'kg/d', toBase: 1 / 86400, category: 'massFlow' },

  { id: 'kgm3', label: 'kilogram / m³', short: 'kg/m³', toBase: 1, category: 'density' },
  { id: 'gcm3', label: 'gram / cm³', short: 'g/cm³', toBase: 1000, category: 'density' },

  /** Specific orbital energy ε [J/kg] */
  { id: 'Jpkg', label: 'joule / kilogram', short: 'J/kg', toBase: 1, category: 'specificEnergy' },
  { id: 'kJpkg', label: 'kilojoule / kilogram', short: 'kJ/kg', toBase: 1000, category: 'specificEnergy' },
  { id: 'MJpkg', label: 'megajoule / kilogram', short: 'MJ/kg', toBase: 1e6, category: 'specificEnergy' },
  { id: 'km2ps2', label: 'km²/s²', short: 'km²/s²', toBase: 1e6, category: 'specificEnergy' },

  { id: 'Ns', label: 'newton-second (N·s)', short: 'N·s', toBase: 1, category: 'impulse' },
  { id: 'kNs', label: 'kilonewton-second (kN·s)', short: 'kN·s', toBase: 1000, category: 'impulse' },

  { id: 'Hz', label: 'hertz (Hz)', short: 'Hz', toBase: 1, category: 'frequency' },
  { id: 'kHz', label: 'kilohertz (kHz)', short: 'kHz', toBase: 1e3, category: 'frequency' },
  { id: 'MHz', label: 'megahertz (MHz)', short: 'MHz', toBase: 1e6, category: 'frequency' },
  { id: 'GHz', label: 'gigahertz (GHz)', short: 'GHz', toBase: 1e9, category: 'frequency' },

  /** Heat flux / irradiance base = W/m² */
  { id: 'Wm2', label: 'watt / m²', short: 'W/m²', toBase: 1, category: 'heatFlux' },
  { id: 'kWm2', label: 'kilowatt / m²', short: 'kW/m²', toBase: 1000, category: 'heatFlux' },
  { id: 'Wcm2', label: 'watt / cm²', short: 'W/cm²', toBase: 1e4, category: 'heatFlux' },
]

export const UNIT_CATEGORIES: { id: UnitCategory; label: string }[] = [
  { id: 'length', label: 'Length' },
  { id: 'velocity', label: 'Velocity' },
  { id: 'accel', label: 'Acceleration' },
  { id: 'mass', label: 'Mass' },
  { id: 'time', label: 'Time' },
  { id: 'angle', label: 'Angle' },
  { id: 'pressure', label: 'Pressure' },
  { id: 'area', label: 'Area' },
  { id: 'volume', label: 'Volume' },
  { id: 'temperature', label: 'Temperature' },
  { id: 'energy', label: 'Energy' },
  { id: 'power', label: 'Power' },
  { id: 'force', label: 'Force' },
  { id: 'massFlow', label: 'Mass flow' },
  { id: 'density', label: 'Density' },
  { id: 'specificEnergy', label: 'Specific energy' },
  { id: 'impulse', label: 'Impulse' },
  { id: 'frequency', label: 'Frequency' },
  { id: 'heatFlux', label: 'Heat flux' },
]

/** Virtual unit id: human-readable multi-part duration (ResultCard only). */
export const PRETTY_DURATION_UNIT = 'pretty' as const

export function unitsForCategory(category: UnitCategory): UnitDef[] {
  return UNIT_DEFS.filter((u) => u.category === category)
}

export function getUnit(id: string): UnitDef | undefined {
  return UNIT_DEFS.find((u) => u.id === id)
}

export function convertValue(value: number, from: UnitDef, to: UnitDef): number {
  if (from.category !== to.category) {
    throw new Error(`Cannot convert ${from.category} to ${to.category}`)
  }
  if (from.category === 'temperature') {
    const si = value * from.toBase + (from.offset ?? 0)
    return (si - (to.offset ?? 0)) / to.toBase
  }
  return (value * from.toBase) / to.toBase
}

/** Convert by unit id within the same category. */
export function convertById(
  value: number,
  fromId: string,
  toId: string,
): number {
  if (fromId === PRETTY_DURATION_UNIT || toId === PRETTY_DURATION_UNIT) {
    // Pretty is display-only; numeric value is always treated as seconds when crossing.
    if (fromId === PRETTY_DURATION_UNIT && toId === PRETTY_DURATION_UNIT) return value
    if (fromId === PRETTY_DURATION_UNIT) return fromSi(value, toId) // value already SI seconds
    if (toId === PRETTY_DURATION_UNIT) return toSi(value, fromId)
  }
  const from = getUnit(fromId)
  const to = getUnit(toId)
  if (!from || !to) return value
  if (from.category !== to.category) return value
  if (!Number.isFinite(value)) return value
  return convertValue(value, from, to)
}

/** Value in selected unit → SI base (m, m/s, rad, K, …). */
export function toSi(value: number, unitId: string): number {
  if (unitId === PRETTY_DURATION_UNIT) return value // already seconds
  const u = getUnit(unitId)
  if (!u || !Number.isFinite(value)) return value
  if (u.category === 'temperature') return value * u.toBase + (u.offset ?? 0)
  return value * u.toBase
}

/** SI base → value in selected unit. */
export function fromSi(si: number, unitId: string): number {
  if (unitId === PRETTY_DURATION_UNIT) return si
  const u = getUnit(unitId)
  if (!u || !Number.isFinite(si)) return si
  if (u.category === 'temperature') return (si - (u.offset ?? 0)) / u.toBase
  return si / u.toBase
}

export function convertAllInCategory(
  value: number,
  fromId: string,
  category: UnitCategory,
): { id: string; label: string; value: number }[] {
  const from = UNIT_DEFS.find((u) => u.id === fromId && u.category === category)
  if (!from || !Number.isFinite(value)) return []
  const base = toSi(value, fromId)
  return unitsForCategory(category).map((u) => ({
    id: u.id,
    label: u.label,
    value: fromSi(base, u.id),
  }))
}

/**
 * Subsets commonly offered on tool fields (shorter lists).
 * `timePretty` starts with virtual `pretty` (auto h/min/s) for ResultCard.
 */
export const TOOL_UNIT_SETS = {
  altitude: ['km', 'm', 'mm', 'nmi', 'mi'],
  length: ['km', 'm', 'mm', 'cm', 'au', 'nmi', 'mi'],
  lengthSmall: ['nm', 'um', 'mm', 'cm', 'm', 'km'],
  wavelength: ['nm', 'um', 'mm', 'm'],
  velocity: ['kmps', 'mps', 'kmph', 'mph'],
  mass: ['kg', 'g_mass', 't', 'lb'],
  time: ['s', 'ms', 'min', 'h', 'd', 'yr'],
  /** Results: human auto first, then pure scalars */
  timePretty: [PRETTY_DURATION_UNIT, 's', 'min', 'h', 'd', 'yr', 'ms'],
  angle: ['deg', 'rad', 'mrad', 'arcmin', 'arcsec'],
  pressure: ['kPa', 'Pa', 'bar', 'atm', 'psi', 'mmHg'],
  /** Cabin / medical partial pressures */
  pressureCabin: ['mmHg', 'kPa', 'Pa', 'atm', 'psi'],
  area: ['mm2', 'cm2', 'm2', 'km2'],
  volume: ['m3', 'L', 'cm3'],
  temperature: ['K', 'C', 'F'],
  energy: ['J', 'kJ', 'MJ', 'Wh', 'kWh'],
  power: ['W', 'kW', 'MW'],
  force: ['N', 'kN', 'lbf'],
  accel: ['mps2', 'g'],
  massFlow: ['kgps', 'gps', 'kgpd'],
  density: ['kgm3', 'gcm3'],
  specificEnergy: ['MJpkg', 'kJpkg', 'Jpkg', 'km2ps2'],
  /** C3 / launch energy: prefer km²/s² first */
  c3: ['km2ps2', 'MJpkg', 'kJpkg', 'Jpkg'],
  impulse: ['Ns', 'kNs'],
  frequency: ['GHz', 'MHz', 'kHz', 'Hz'],
  heatFlux: ['Wm2', 'kWm2', 'Wcm2'],
  /** Isp-like seconds (still time category) */
  isp: ['s'],
} as const satisfies Record<string, readonly string[]>

