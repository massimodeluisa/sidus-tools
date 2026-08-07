/**
 * Pure-JS surface of satellite.js v7 for browser bundling.
 *
 * The package root re-exports WASM pthreads bulk APIs (`#wasm-multi-thread`).
 * Vite/Rolldown bundles those as workers in IIFE format, which rejects top-level
 * await and breaks `vite build`. SIDUS only needs classic SGP4/SDP4 + transforms.
 *
 * Resolved via vite `resolve.alias` for the `satellite.js` package id.
 * TypeScript still types against the real package (node_modules exports).
 */
export { twoline2satrec, json2satrec } from '../../../node_modules/satellite.js/dist/io.js'
export { propagate, sgp4, gstime } from '../../../node_modules/satellite.js/dist/propagation.js'
export {
  radiansToDegrees,
  degreesToRadians,
  degreesLat,
  degreesLong,
  radiansLat,
  radiansLong,
  geodeticToEcf,
  eciToGeodetic,
  eciToEcf,
  ecfToEci,
  ecfToLookAngles,
} from '../../../node_modules/satellite.js/dist/transforms.js'
export { jday, invjday } from '../../../node_modules/satellite.js/dist/ext.js'
export { dopplerFactor } from '../../../node_modules/satellite.js/dist/dopplerFactor.js'
export { sunPos } from '../../../node_modules/satellite.js/dist/sun.js'
export { checkForDecay } from '../../../node_modules/satellite.js/dist/propagation/check-for-decay.js'
export { SatRecError } from '../../../node_modules/satellite.js/dist/propagation/SatRec.js'
export type { SatRec } from '../../../node_modules/satellite.js/dist/propagation/SatRec.js'
