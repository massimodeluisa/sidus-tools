/**
 * Polar sky plot for one pass: azimuth around the ring, elevation toward
 * the center, north up. Samples are already in-pass look angles.
 */
type Sample = { azimuthRad: number | null; elevationRad: number }

type Props = {
  samples: Sample[]
  caption: string
  north: string
  east: string
  south: string
  west: string
}

const CX = 100
const CY = 100
const R = 86

function project(azimuthRad: number | null, elevationRad: number): [number, number] | null {
  const elDeg = Math.min(90, Math.max(0, (elevationRad * 180) / Math.PI))
  const rho = R * (1 - elDeg / 90)
  if (azimuthRad == null) return rho === 0 ? [CX, CY] : null
  return [CX + rho * Math.sin(azimuthRad), CY - rho * Math.cos(azimuthRad)]
}

export function PassSkyPlot({ samples, caption, north, east, south, west }: Props) {
  const points = samples
    .map((sample) => project(sample.azimuthRad, sample.elevationRad))
    .filter((point): point is [number, number] => point !== null)
    .map((point) => point.join(','))
    .join(' ')
  const rings = [0, 30, 60]
  return (
    <figure className="min-w-0">
      <svg viewBox="0 0 200 200" className="mx-auto h-64 w-full max-w-xs text-fg" role="img" aria-label={caption}>
        {rings.map((el) => (
          <circle
            key={el}
            cx={CX}
            cy={CY}
            r={R * (1 - el / 90)}
            className="fill-none stroke-border"
            strokeWidth={el === 0 ? 1.25 : 0.6}
          />
        ))}
        <line x1={CX} y1={CY - R} x2={CX} y2={CY + R} className="stroke-border" strokeWidth={0.5} />
        <line x1={CX - R} y1={CY} x2={CX + R} y2={CY} className="stroke-border" strokeWidth={0.5} />
        {points ? (
          <polyline points={points} className="fill-none stroke-signal" strokeWidth={1.6} strokeLinejoin="round" />
        ) : null}
        {samples[0] ? <Dot sample={samples[0]} /> : null}
        {samples.length > 2 ? <Dot sample={samples[Math.floor(samples.length / 2)]!} /> : null}
        {samples.length > 1 ? <Dot sample={samples[samples.length - 1]!} /> : null}
        <text x={CX} y={12} textAnchor="middle" className="fill-muted text-[9px]">
          {north}
        </text>
        <text x={196} y={CY + 3} textAnchor="end" className="fill-muted text-[9px]">
          {east}
        </text>
        <text x={CX} y={196} textAnchor="middle" className="fill-muted text-[9px]">
          {south}
        </text>
        <text x={6} y={CY + 3} textAnchor="start" className="fill-muted text-[9px]">
          {west}
        </text>
      </svg>
      <figcaption className="mt-1 font-mono text-[10px] leading-relaxed text-subtle">{caption}</figcaption>
    </figure>
  )
}

function Dot({ sample }: { sample: Sample }) {
  const projected = project(sample.azimuthRad, sample.elevationRad)
  if (!projected) return null
  const [x, y] = projected
  return <circle cx={x} cy={y} r={2.2} className="fill-signal" />
}
