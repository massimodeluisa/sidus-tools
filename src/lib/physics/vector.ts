/** Minimal 3D vector helpers: pure SI. */

export type Vec3 = [number, number, number]

export function vadd(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}

export function vsub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

export function vscale(a: Vec3, s: number): Vec3 {
  return [a[0] * s, a[1] * s, a[2] * s]
}

export function vdot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

export function vcross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ]
}

export function vnorm(a: Vec3): number {
  return Math.hypot(a[0], a[1], a[2])
}

export function vunit(a: Vec3): Vec3 {
  const n = vnorm(a)
  if (!(n > 0)) return [0, 0, 0]
  return vscale(a, 1 / n)
}

export function vmag2(a: Vec3): number {
  return vdot(a, a)
}
