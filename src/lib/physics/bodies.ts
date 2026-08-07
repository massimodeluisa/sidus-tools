import { EARTH_MASS, EARTH_MU, EARTH_RADIUS, SOLAR_MASS, SUN_MU } from './constants'

export type Body = {
  id: string
  name: string
  mu: number
  radius: number
  mass: number
  color: string
  type: 'star' | 'planet' | 'moon' | 'dwarf'
  soi?: number
}

export const BODIES: Body[] = [
  { id: 'sun', name: 'Sun', mu: SUN_MU, radius: 695_700_000, mass: SOLAR_MASS, color: '#e8d5a3', type: 'star' },
  { id: 'mercury', name: 'Mercury', mu: 2.2032e13, radius: 2_439_700, mass: 3.3011e23, color: '#9a9a9a', type: 'planet' },
  { id: 'venus', name: 'Venus', mu: 3.24859e14, radius: 6_051_800, mass: 4.8675e24, color: '#c9b896', type: 'planet' },
  { id: 'earth', name: 'Earth', mu: EARTH_MU, radius: EARTH_RADIUS, mass: EARTH_MASS, color: '#7a9bb8', type: 'planet', soi: 9.24e8 },
  { id: 'moon', name: 'Moon', mu: 4.9028e12, radius: 1_737_400, mass: 7.342e22, color: '#b0b0b0', type: 'moon' },
  { id: 'mars', name: 'Mars', mu: 4.282837e13, radius: 3_389_500, mass: 6.4171e23, color: '#c47a5a', type: 'planet', soi: 5.77e8 },
  { id: 'jupiter', name: 'Jupiter', mu: 1.26686534e17, radius: 69_911_000, mass: 1.8982e27, color: '#c4a882', type: 'planet' },
  { id: 'saturn', name: 'Saturn', mu: 3.7931187e16, radius: 58_232_000, mass: 5.6834e26, color: '#d4c4a0', type: 'planet' },
  { id: 'uranus', name: 'Uranus', mu: 5.793939e15, radius: 25_362_000, mass: 8.681e25, color: '#9ec4c8', type: 'planet' },
  { id: 'neptune', name: 'Neptune', mu: 6.836529e15, radius: 24_622_000, mass: 1.02413e26, color: '#5a7ab0', type: 'planet' },
  { id: 'pluto', name: 'Pluto', mu: 8.71e11, radius: 1_188_300, mass: 1.303e22, color: '#b8a898', type: 'dwarf' },
]

export function getBody(id: string): Body {
  return BODIES.find((b) => b.id === id) ?? BODIES.find((b) => b.id === 'earth')!
}
