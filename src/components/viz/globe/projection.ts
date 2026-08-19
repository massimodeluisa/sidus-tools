/**
 * CPU-side copy of MapLibre's elevated vertex projection, so an HTML
 * overlay label can sit at the true elevated screen position of a point the
 * WebGL altitude layer draws.
 *
 * Reproduces the shipped GLSL exactly (v5.24,
 * src/shaders/glsl/_projection_globe.vertex.glsl, projectToSphere() +
 * interpolateProjectionFor3D()):
 *   1. mercator_pos = tileMercatorCoords.xy + tileMercatorCoords.zw *
 *      [merc.x, merc.y] (tileMercatorCoords is identity for custom layers
 *      per MapLibre's own type docs, but applied properly here in case that
 *      ever changes)
 *   2. spherical.x/y from mercator_pos via the same atan/exp formula as the
 *      shader; spherePos = unit vector on the globe sphere
 *   3. elevatedPos = spherePos * (1 + elevationMeters / GLOBE_RADIUS_M)
 *   4. clip = mainMatrix * [elevatedPos, 1] (column-major 4x4, the WebGL /
 *      glMatrix convention)
 *   5. perspective divide by clip.w to NDC; discard if w <= 0 (behind the
 *      camera) or |ndc.x| > 1 or |ndc.y| > 1 (off screen)
 *   6. NDC to CSS pixels using the canvas's CSS (not device-pixel) size, Y
 *      flipped since NDC +Y is up and screen +Y is down
 *
 * Deliberately ignores the globe/mercator projectionTransition blend the
 * shader also does (mixing in a fallback flat-mercator matrix): that only
 * matters during MapLibre's automatic globe-to-mercator morph at very high
 * zoom, a known simplification at the extreme end and exact for the normal
 * globe case.
 */

import { MercatorCoordinate, type ProjectionData } from 'maplibre-gl'
import { GLOBE_RADIUS_M } from './track'

export function transformMat4Vec4(
  m: ArrayLike<number>,
  v: [number, number, number, number],
): [number, number, number, number] {
  const [x, y, z, w] = v
  return [
    m[0] * x + m[4] * y + m[8] * z + m[12] * w,
    m[1] * x + m[5] * y + m[9] * z + m[13] * w,
    m[2] * x + m[6] * y + m[10] * z + m[14] * w,
    m[3] * x + m[7] * y + m[11] * z + m[15] * w,
  ]
}

/**
 * `variantName` branches this the same way the GPU side branches (see
 * toVertex in altitudeLayer.ts for the full citation): under "globe" this
 * replicates projectToSphere() + interpolateProjectionFor3D(); under
 * "mercator" it replicates the much simpler flat projectTileWithElevation()
 * from _projection_mercator.vertex.glsl (`u_projection_matrix *
 * vec4(posInTile, elevation, 1.0)`: no spherical math, no tileMercatorCoords
 * remapping, elevation in mercator units).
 */
export function projectElevatedToScreen(
  lon: number,
  lat: number,
  elevationMeters: number,
  projectionData: ProjectionData,
  canvasCssWidth: number,
  canvasCssHeight: number,
  variantName: string | null,
): { x: number; y: number } | null {
  const merc = MercatorCoordinate.fromLngLat({ lng: lon, lat })

  let clip: [number, number, number, number]
  if (variantName === 'mercator') {
    const elevationMercUnits = elevationMeters * merc.meterInMercatorCoordinateUnits()
    clip = transformMat4Vec4(projectionData.mainMatrix, [merc.x, merc.y, elevationMercUnits, 1])
  } else {
    const tmc = projectionData.tileMercatorCoords
    const mercatorPos = [tmc[0] + tmc[2] * merc.x, tmc[1] + tmc[3] * merc.y]

    const sphericalX = mercatorPos[0] * Math.PI * 2 + Math.PI
    const sphericalY = 2 * Math.atan(Math.exp(Math.PI - mercatorPos[1] * Math.PI * 2)) - Math.PI * 0.5
    const len = Math.cos(sphericalY)
    const spherePos = [Math.sin(sphericalX) * len, Math.sin(sphericalY), Math.cos(sphericalX) * len]

    const scale = 1 + elevationMeters / GLOBE_RADIUS_M
    clip = transformMat4Vec4(projectionData.mainMatrix, [
      spherePos[0] * scale,
      spherePos[1] * scale,
      spherePos[2] * scale,
      1,
    ])
  }

  if (clip[3] <= 0) return null

  const ndcX = clip[0] / clip[3]
  const ndcY = clip[1] / clip[3]
  if (ndcX < -1 || ndcX > 1 || ndcY < -1 || ndcY > 1) return null

  return {
    x: (ndcX * 0.5 + 0.5) * canvasCssWidth,
    y: (1 - (ndcY * 0.5 + 0.5)) * canvasCssHeight,
  }
}
