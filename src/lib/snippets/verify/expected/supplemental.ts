/** Expected outputs for snippet variants that do not represent separate UI tools. */
import { elementsToRv } from '../../../physics'
import { num, put, type ExpectedFn } from './shared'

export const SUPPLEMENTAL_EXPECTED: Record<string, ExpectedFn> = {
  'rv-elements-inverse': (bag) => {
    const state = elementsToRv(
      {
        a: num(bag, 'a'),
        e: num(bag, 'e'),
        i: num(bag, 'i'),
        raan: num(bag, 'raan'),
        argp: num(bag, 'argp'),
        nu: num(bag, 'nu'),
      },
      num(bag, 'mu'),
    )
    if (!state) throw new Error('rv-elements-inverse: elementsToRv rejected the verification inputs')
    const out: Record<string, number> = {}
    put(out, ['rx_out'], state.r[0])
    put(out, ['ry_out'], state.r[1])
    put(out, ['rz_out'], state.r[2])
    put(out, ['vx_out'], state.v[0])
    put(out, ['vy_out'], state.v[1])
    put(out, ['vz_out'], state.v[2])
    return out
  },
}
