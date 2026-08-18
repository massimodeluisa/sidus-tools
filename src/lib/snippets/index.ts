import type { FormulaSnippet } from './types'
import { circularSnippets } from './circular'
import { hohmannSnippets } from './hohmann'
import { escapeSnippets } from './escape'
import { visVivaSnippets } from './vis-viva'
import { apsidesSnippets } from './apsides'
import { planeChangeSnippets } from './plane-change'
import { biellipticSnippets } from './bielliptic'
import { rocketSnippets } from './rocket-equation'
import { rvElementsSnippets } from './rv-elements'
import { keplerSnippets } from './kepler-propagate'
import { lambertSnippets } from './lambert'
import { sgp4Snippets } from './sgp4'
import { lookAnglesSnippets } from './look-angles'
import { passPredictSnippets } from './pass-predict'
import { j2Snippets } from './j2-drift'
import { multiStageSnippets } from './multi-stage'
import { plotterSnippets } from './plotter'
import { unitsSnippets } from './units'
import { bodiesSnippets } from './bodies'
import { launchAzimuthSnippets } from './launch-azimuth'
import { ssoSnippets } from './sso'
import { dynamicPressureSnippets } from './dynamic-pressure'
import { cwSnippets } from './cw-rendezvous'
import { linkBudgetSnippets } from './link-budget'
import { phasingSnippets } from './phasing'
import { metabolicSnippets } from './metabolic-load'
import { cabinAtmosphereSnippets } from './cabin-atmosphere'
import { liohSnippets } from './lioh-scrubber'
import { cabinLeakSnippets } from './cabin-leak'
import { thermalLoopSnippets } from './thermal-loop'
import {
  customBodySnippets,
  hyperbolicC3Snippets,
  hohmannPlaneSnippets,
  propellantMassSnippets,
  idealThrustSnippets,
  soiSnippets,
  synodicSnippets,
  eclipseSnippets,
  lightTimeSnippets,
  solarPressureSnippets,
  ballisticSnippets,
  circularizeSnippets,
  geoSnippets,
  deltaASnippets,
  planeApoSnippets,
} from './wave2'
import {
  deltaVBudgetSnippets,
  heatFluxSnippets,
  coellipticSnippets,
  losSnippets,
  oberthSnippets,
  horizonSnippets,
  beamwidthSnippets,
  deorbitSnippets,
  equalStageSnippets,
  meanMotionSnippets,
} from './wave3'
import {
  solarArraySnippets, batterySnippets, rcsSnippets, angDiamSnippets, diffSnippets,
  thermSnippets, dragSnippets, wheelSnippets, apoSnippets, gtSnippets, atSnippets, pmSnippets, ebSnippets,
} from './wave4'
import { hohmannTimeSnippets, energySnippets, trueAnomSnippets, flybySnippets, nodalSnippets, eccAnomSnippets, scaleSnippets } from './wave5'
import { catchupSnippets, impulseBudgetSnippets, ssoPeriodSnippets, massStackSnippets } from './wave6'
import { critIncSnippets, relPerSnippets, enVinfSnippets, geoLtSnippets, plFracSnippets } from './wave7'
import { hSnippets, escMarginSnippets } from './wave8'
import {
  sphericalDistanceSnippets,
  elevationAzimuthSnippets,
  vectorAngleSnippets,
  helioHohmannSnippets,
  patchedConicSnippets,
  surfaceAccessSnippets,
  orbit3dSnippets,
} from './wave9'
import { isentropicNozzleSnippets } from './tools/isentropic-nozzle'
import { characteristicVelocityCstarSnippets } from './tools/characteristic-velocity-cstar'
import { throatAreaSizingSnippets } from './tools/throat-area-sizing'
import { rocketThrustChamberSnippets } from './tools/rocket-thrust-chamber'
import { mixtureRatioSnippets } from './tools/mixture-ratio'
import { tankUllageSnippets } from './tools/tank-ullage'
import { blowdownTankSnippets } from './tools/blowdown-tank'
import { propellantDensityImpulseSnippets } from './tools/propellant-density-impulse'
import { coldGasThrustSnippets } from './tools/cold-gas-thrust'
import { ionThrusterEfficiencySnippets } from './tools/ion-thruster-efficiency'
import { hallThrusterIspSnippets } from './tools/hall-thruster-isp'
import { gnssPseudorangeSnippets } from './tools/gnss-pseudorange'
import { gnssGeometryGdopSnippets } from './tools/gnss-geometry-gdop'
import { laserLinkBudgetSnippets } from './tools/laser-link-budget'
import { laserPointingJitterSnippets } from './tools/laser-pointing-jitter'
import { laserTimeOfFlightSnippets } from './tools/laser-time-of-flight'
import { impedanceMatchingSnippets } from './tools/impedance-matching'
import { antennaGainEffectiveSnippets } from './tools/antenna-gain-effective'
import { dopplerShiftLeoSnippets } from './tools/doppler-shift-leo'
import { radarEquationSnippets } from './tools/radar-equation'
import { rainAttenuationSimpleSnippets } from './tools/rain-attenuation-simple'
import { ttcEbnoSnippets } from './tools/ttc-ebno'
import { opticalBerQSnippets } from './tools/optical-ber-q'
import { gnssTroposphereDelaySnippets } from './tools/gnss-troposphere-delay'
import { freeFallTimeSnippets } from './tools/free-fall-time'
import { ballisticRangeSnippets } from './tools/ballistic-range'
import { terminalVelocitySnippets } from './tools/terminal-velocity'
import { parachuteDescentSnippets } from './tools/parachute-descent'
import { coordinatedTurnBankSnippets } from './tools/coordinated-turn-bank'
import { slewRatePointingSnippets } from './tools/slew-rate-pointing'
import { magneticTorqueSnippets } from './tools/magnetic-torque'
import { gravityGradientTorqueSnippets } from './tools/gravity-gradient-torque'
import { rwMomentumCapacitySnippets } from './tools/rw-momentum-capacity'
import { sunSensorConeSnippets } from './tools/sun-sensor-cone'
import { starTrackerNoiseSnippets } from './tools/star-tracker-noise'
import { constellationWalkerSnippets } from './tools/constellation-walker'
import { coverageSwathSnippets } from './tools/coverage-swath'
import { revisitTimeSimpleSnippets } from './tools/revisit-time-simple'
import { geoStationkeepingDvSnippets } from './tools/geo-stationkeeping-dv'
import { geoPropellantBudgetSnippets } from './tools/geo-propellant-budget'
import { dragMakeUpDvSnippets } from './tools/drag-make-up-dv'
import { tisserandParameterSnippets } from './tools/tisserand-parameter'
import { epsOrbitAverageSnippets } from './tools/eps-orbit-average'
import { relativityClockRateSnippets } from './tools/relativity-clock-rate'
import { gnssIonosphereKlobucharSnippets } from './tools/gnss-ionosphere-klobuchar'
import { opticalGsdSnippets } from './tools/optical-gsd'
import { solarSailAccelSnippets } from './tools/solar-sail-accel'
import { finiteBurnDvSnippets } from './tools/finite-burn-dv'
import { bPlaneImpactSnippets } from './tools/b-plane-impact'
import { cr3bpJacobiSnippets } from './tools/cr3bp-jacobi'
import { orbitLifetimeRoughSnippets } from './tools/orbit-lifetime-rough'
import { geoDriftRateSnippets } from './tools/geo-drift-rate'
import { stefanBoltzmannSnippets } from './tools/stefan-boltzmann'
import { wienPeakSnippets } from './tools/wien-peak'
import { thrusterImpulseBitSnippets } from './tools/thruster-impulse-bit'
import { argPerigeeDriftJ2Snippets } from './tools/arg-perigee-drift-j2'
import { sarAzimuthResolutionSnippets } from './tools/sar-azimuth-resolution'
import { radarRangeResolutionSnippets } from './tools/radar-range-resolution'
import { linkMarginSnippets } from './tools/link-margin'
import { aerobrakingPassSnippets } from './tools/aerobraking-pass'
import { diffractionLimitSnippets } from './tools/diffraction-limit'
import { panelEolPowerSnippets } from './tools/panel-eol-power'
import { magnetorquerMomentSnippets } from './tools/magnetorquer-moment'
import { hyperbolicEccentricitySnippets } from './tools/hyperbolic-eccentricity'
import { captureCircularizeSnippets } from './tools/capture-circularize'
import { gravityLossSnippets } from './tools/gravity-loss'
import { batteryDodSnippets } from './tools/battery-dod'
import { umbraLengthSnippets } from './tools/umbra-length'
import { meanAnomalyFromESnippets } from './tools/mean-anomaly-from-e'
import { flightPathAngleSnippets } from './tools/flight-path-angle'
import { hoopStressSnippets } from './tools/hoop-stress'
import { exponentialDensitySnippets } from './tools/exponential-density'
import { hillSphereSnippets } from './tools/hill-sphere'
import { edelbaumDvSnippets } from './tools/edelbaum-dv'
import { repeatingGroundTrackSnippets } from './tools/repeating-ground-track'
import { pointingBudgetRssSnippets } from './tools/pointing-budget-rss'
import { boiloffRateSnippets } from './tools/boiloff-rate'
import { residualDipoleTorqueSnippets } from './tools/residual-dipole-torque'
import { solarFluxDistanceSnippets } from './tools/solar-flux-distance'
import { nyquistRateSnippets } from './tools/nyquist-rate'
import { dataVolumeSnippets } from './tools/data-volume'
import { earthIrFluxSnippets } from './tools/earth-ir-flux'
import { molniyaTundraSnippets } from './tools/molniya-tundra'
import { frozenOrbitSnippets } from './tools/frozen-orbit'
import { thrustToWeightSnippets } from './tools/thrust-to-weight'
import { planckRadianceSnippets } from './tools/planck-radiance'
import { eirpGtSnippets } from './tools/eirp-gt'
import { quaternionEulerSnippets } from './tools/quaternion-euler'
import { porkchopEarthMarsSnippets } from './tools/porkchop-earth-mars'
import { conjunctionPcSnippets } from './tools/conjunction-pc'
import { bPlaneTargetSnippets } from './tools/b-plane-target'
import { questAttitudeSnippets } from './tools/quest-attitude'
import { herrickGibbsSnippets } from './tools/herrick-gibbs'
import { lunisolarRatesSnippets } from './tools/lunisolar-rates'
import { pumpCrankSnippets } from './tools/pump-crank'
import { schweighartSedwickSnippets } from './tools/schweighart-sedwick'

export * from './types'
export * from './liveValues'
export * from './runners'

const MAP: Record<string, FormulaSnippet> = {
  [circularSnippets.formulaId]: circularSnippets,
  [hohmannSnippets.formulaId]: hohmannSnippets,
  [escapeSnippets.formulaId]: escapeSnippets,
  [visVivaSnippets.formulaId]: visVivaSnippets,
  [apsidesSnippets.formulaId]: apsidesSnippets,
  [planeChangeSnippets.formulaId]: planeChangeSnippets,
  [biellipticSnippets.formulaId]: biellipticSnippets,
  [rocketSnippets.formulaId]: rocketSnippets,
  [rvElementsSnippets.formulaId]: rvElementsSnippets,
  [keplerSnippets.formulaId]: keplerSnippets,
  [lambertSnippets.formulaId]: lambertSnippets,
  [sgp4Snippets.formulaId]: sgp4Snippets,
  [lookAnglesSnippets.formulaId]: lookAnglesSnippets,
  [passPredictSnippets.formulaId]: passPredictSnippets,
  [j2Snippets.formulaId]: j2Snippets,
  [multiStageSnippets.formulaId]: multiStageSnippets,
  [plotterSnippets.formulaId]: plotterSnippets,
  [unitsSnippets.formulaId]: unitsSnippets,
  [bodiesSnippets.formulaId]: bodiesSnippets,
  [launchAzimuthSnippets.formulaId]: launchAzimuthSnippets,
  [ssoSnippets.formulaId]: ssoSnippets,
  [dynamicPressureSnippets.formulaId]: dynamicPressureSnippets,
  [cwSnippets.formulaId]: cwSnippets,
  [linkBudgetSnippets.formulaId]: linkBudgetSnippets,
  [phasingSnippets.formulaId]: phasingSnippets,
  [metabolicSnippets.formulaId]: metabolicSnippets,
  [cabinAtmosphereSnippets.formulaId]: cabinAtmosphereSnippets,
  [liohSnippets.formulaId]: liohSnippets,
  [cabinLeakSnippets.formulaId]: cabinLeakSnippets,
  [thermalLoopSnippets.formulaId]: thermalLoopSnippets,
  [customBodySnippets.formulaId]: customBodySnippets,
  [hyperbolicC3Snippets.formulaId]: hyperbolicC3Snippets,
  [hohmannPlaneSnippets.formulaId]: hohmannPlaneSnippets,
  [propellantMassSnippets.formulaId]: propellantMassSnippets,
  [idealThrustSnippets.formulaId]: idealThrustSnippets,
  [soiSnippets.formulaId]: soiSnippets,
  [synodicSnippets.formulaId]: synodicSnippets,
  [eclipseSnippets.formulaId]: eclipseSnippets,
  [lightTimeSnippets.formulaId]: lightTimeSnippets,
  [solarPressureSnippets.formulaId]: solarPressureSnippets,
  [ballisticSnippets.formulaId]: ballisticSnippets,
  [circularizeSnippets.formulaId]: circularizeSnippets,
  [geoSnippets.formulaId]: geoSnippets,
  [deltaASnippets.formulaId]: deltaASnippets,
  [planeApoSnippets.formulaId]: planeApoSnippets,
  [deltaVBudgetSnippets.formulaId]: deltaVBudgetSnippets,
  [heatFluxSnippets.formulaId]: heatFluxSnippets,
  [coellipticSnippets.formulaId]: coellipticSnippets,
  [losSnippets.formulaId]: losSnippets,
  [oberthSnippets.formulaId]: oberthSnippets,
  [horizonSnippets.formulaId]: horizonSnippets,
  [beamwidthSnippets.formulaId]: beamwidthSnippets,
  [deorbitSnippets.formulaId]: deorbitSnippets,
  [equalStageSnippets.formulaId]: equalStageSnippets,
  [meanMotionSnippets.formulaId]: meanMotionSnippets,
  [solarArraySnippets.formulaId]: solarArraySnippets,
  [batterySnippets.formulaId]: batterySnippets,
  [rcsSnippets.formulaId]: rcsSnippets,
  [angDiamSnippets.formulaId]: angDiamSnippets,
  [diffSnippets.formulaId]: diffSnippets,
  [thermSnippets.formulaId]: thermSnippets,
  [dragSnippets.formulaId]: dragSnippets,
  [wheelSnippets.formulaId]: wheelSnippets,
  [apoSnippets.formulaId]: apoSnippets,
  [gtSnippets.formulaId]: gtSnippets,
  [atSnippets.formulaId]: atSnippets,
  [pmSnippets.formulaId]: pmSnippets,
  [ebSnippets.formulaId]: ebSnippets,
  [hohmannTimeSnippets.formulaId]: hohmannTimeSnippets,
  [energySnippets.formulaId]: energySnippets,
  [trueAnomSnippets.formulaId]: trueAnomSnippets,
  [flybySnippets.formulaId]: flybySnippets,
  [nodalSnippets.formulaId]: nodalSnippets,
  [eccAnomSnippets.formulaId]: eccAnomSnippets,
  [scaleSnippets.formulaId]: scaleSnippets,
  [catchupSnippets.formulaId]: catchupSnippets,
  [impulseBudgetSnippets.formulaId]: impulseBudgetSnippets,
  [ssoPeriodSnippets.formulaId]: ssoPeriodSnippets,
  [massStackSnippets.formulaId]: massStackSnippets,
  [critIncSnippets.formulaId]: critIncSnippets,
  [relPerSnippets.formulaId]: relPerSnippets,
  [enVinfSnippets.formulaId]: enVinfSnippets,
  [geoLtSnippets.formulaId]: geoLtSnippets,
  [plFracSnippets.formulaId]: plFracSnippets,
  [hSnippets.formulaId]: hSnippets,
  [escMarginSnippets.formulaId]: escMarginSnippets,
  [sphericalDistanceSnippets.formulaId]: sphericalDistanceSnippets,
  [elevationAzimuthSnippets.formulaId]: elevationAzimuthSnippets,
  [vectorAngleSnippets.formulaId]: vectorAngleSnippets,
  [helioHohmannSnippets.formulaId]: helioHohmannSnippets,
  [patchedConicSnippets.formulaId]: patchedConicSnippets,
  [surfaceAccessSnippets.formulaId]: surfaceAccessSnippets,
  [orbit3dSnippets.formulaId]: orbit3dSnippets,
  [isentropicNozzleSnippets.formulaId]: isentropicNozzleSnippets,
  [characteristicVelocityCstarSnippets.formulaId]: characteristicVelocityCstarSnippets,
  [throatAreaSizingSnippets.formulaId]: throatAreaSizingSnippets,
  [rocketThrustChamberSnippets.formulaId]: rocketThrustChamberSnippets,
  [mixtureRatioSnippets.formulaId]: mixtureRatioSnippets,
  [tankUllageSnippets.formulaId]: tankUllageSnippets,
  [blowdownTankSnippets.formulaId]: blowdownTankSnippets,
  [propellantDensityImpulseSnippets.formulaId]: propellantDensityImpulseSnippets,
  [coldGasThrustSnippets.formulaId]: coldGasThrustSnippets,
  [ionThrusterEfficiencySnippets.formulaId]: ionThrusterEfficiencySnippets,
  [hallThrusterIspSnippets.formulaId]: hallThrusterIspSnippets,
  [gnssPseudorangeSnippets.formulaId]: gnssPseudorangeSnippets,
  [gnssGeometryGdopSnippets.formulaId]: gnssGeometryGdopSnippets,
  [laserLinkBudgetSnippets.formulaId]: laserLinkBudgetSnippets,
  [laserPointingJitterSnippets.formulaId]: laserPointingJitterSnippets,
  [laserTimeOfFlightSnippets.formulaId]: laserTimeOfFlightSnippets,
  [impedanceMatchingSnippets.formulaId]: impedanceMatchingSnippets,
  [antennaGainEffectiveSnippets.formulaId]: antennaGainEffectiveSnippets,
  [dopplerShiftLeoSnippets.formulaId]: dopplerShiftLeoSnippets,
  [radarEquationSnippets.formulaId]: radarEquationSnippets,
  [rainAttenuationSimpleSnippets.formulaId]: rainAttenuationSimpleSnippets,
  [ttcEbnoSnippets.formulaId]: ttcEbnoSnippets,
  [opticalBerQSnippets.formulaId]: opticalBerQSnippets,
  [gnssTroposphereDelaySnippets.formulaId]: gnssTroposphereDelaySnippets,
  [freeFallTimeSnippets.formulaId]: freeFallTimeSnippets,
  [ballisticRangeSnippets.formulaId]: ballisticRangeSnippets,
  [terminalVelocitySnippets.formulaId]: terminalVelocitySnippets,
  [parachuteDescentSnippets.formulaId]: parachuteDescentSnippets,
  [coordinatedTurnBankSnippets.formulaId]: coordinatedTurnBankSnippets,
  [slewRatePointingSnippets.formulaId]: slewRatePointingSnippets,
  [magneticTorqueSnippets.formulaId]: magneticTorqueSnippets,
  [gravityGradientTorqueSnippets.formulaId]: gravityGradientTorqueSnippets,
  [rwMomentumCapacitySnippets.formulaId]: rwMomentumCapacitySnippets,
  [sunSensorConeSnippets.formulaId]: sunSensorConeSnippets,
  [starTrackerNoiseSnippets.formulaId]: starTrackerNoiseSnippets,
  [constellationWalkerSnippets.formulaId]: constellationWalkerSnippets,
  [coverageSwathSnippets.formulaId]: coverageSwathSnippets,
  [revisitTimeSimpleSnippets.formulaId]: revisitTimeSimpleSnippets,
  [geoStationkeepingDvSnippets.formulaId]: geoStationkeepingDvSnippets,
  [geoPropellantBudgetSnippets.formulaId]: geoPropellantBudgetSnippets,
  [dragMakeUpDvSnippets.formulaId]: dragMakeUpDvSnippets,
  [tisserandParameterSnippets.formulaId]: tisserandParameterSnippets,
  [epsOrbitAverageSnippets.formulaId]: epsOrbitAverageSnippets,
  [relativityClockRateSnippets.formulaId]: relativityClockRateSnippets,
  [gnssIonosphereKlobucharSnippets.formulaId]: gnssIonosphereKlobucharSnippets,
  [opticalGsdSnippets.formulaId]: opticalGsdSnippets,
  [solarSailAccelSnippets.formulaId]: solarSailAccelSnippets,
  [finiteBurnDvSnippets.formulaId]: finiteBurnDvSnippets,
  [bPlaneImpactSnippets.formulaId]: bPlaneImpactSnippets,
  [cr3bpJacobiSnippets.formulaId]: cr3bpJacobiSnippets,
  [orbitLifetimeRoughSnippets.formulaId]: orbitLifetimeRoughSnippets,
  [geoDriftRateSnippets.formulaId]: geoDriftRateSnippets,
  [stefanBoltzmannSnippets.formulaId]: stefanBoltzmannSnippets,
  [wienPeakSnippets.formulaId]: wienPeakSnippets,
  [thrusterImpulseBitSnippets.formulaId]: thrusterImpulseBitSnippets,
  [argPerigeeDriftJ2Snippets.formulaId]: argPerigeeDriftJ2Snippets,
  [sarAzimuthResolutionSnippets.formulaId]: sarAzimuthResolutionSnippets,
  [radarRangeResolutionSnippets.formulaId]: radarRangeResolutionSnippets,
  [linkMarginSnippets.formulaId]: linkMarginSnippets,
  [aerobrakingPassSnippets.formulaId]: aerobrakingPassSnippets,
  [diffractionLimitSnippets.formulaId]: diffractionLimitSnippets,
  [panelEolPowerSnippets.formulaId]: panelEolPowerSnippets,
  [magnetorquerMomentSnippets.formulaId]: magnetorquerMomentSnippets,
  [hyperbolicEccentricitySnippets.formulaId]: hyperbolicEccentricitySnippets,
  [captureCircularizeSnippets.formulaId]: captureCircularizeSnippets,
  [gravityLossSnippets.formulaId]: gravityLossSnippets,
  [batteryDodSnippets.formulaId]: batteryDodSnippets,
  [umbraLengthSnippets.formulaId]: umbraLengthSnippets,
  [meanAnomalyFromESnippets.formulaId]: meanAnomalyFromESnippets,
  [flightPathAngleSnippets.formulaId]: flightPathAngleSnippets,
  [hoopStressSnippets.formulaId]: hoopStressSnippets,
  [exponentialDensitySnippets.formulaId]: exponentialDensitySnippets,
  [hillSphereSnippets.formulaId]: hillSphereSnippets,
  [edelbaumDvSnippets.formulaId]: edelbaumDvSnippets,
  [repeatingGroundTrackSnippets.formulaId]: repeatingGroundTrackSnippets,
  [pointingBudgetRssSnippets.formulaId]: pointingBudgetRssSnippets,
  [boiloffRateSnippets.formulaId]: boiloffRateSnippets,
  [residualDipoleTorqueSnippets.formulaId]: residualDipoleTorqueSnippets,
  [solarFluxDistanceSnippets.formulaId]: solarFluxDistanceSnippets,
  [nyquistRateSnippets.formulaId]: nyquistRateSnippets,
  [dataVolumeSnippets.formulaId]: dataVolumeSnippets,
  [earthIrFluxSnippets.formulaId]: earthIrFluxSnippets,
  [molniyaTundraSnippets.formulaId]: molniyaTundraSnippets,
  [frozenOrbitSnippets.formulaId]: frozenOrbitSnippets,
  [thrustToWeightSnippets.formulaId]: thrustToWeightSnippets,
  [planckRadianceSnippets.formulaId]: planckRadianceSnippets,
  [eirpGtSnippets.formulaId]: eirpGtSnippets,
  [quaternionEulerSnippets.formulaId]: quaternionEulerSnippets,
  [porkchopEarthMarsSnippets.formulaId]: porkchopEarthMarsSnippets,
  [conjunctionPcSnippets.formulaId]: conjunctionPcSnippets,
  [bPlaneTargetSnippets.formulaId]: bPlaneTargetSnippets,
  [questAttitudeSnippets.formulaId]: questAttitudeSnippets,
  [herrickGibbsSnippets.formulaId]: herrickGibbsSnippets,
  [lunisolarRatesSnippets.formulaId]: lunisolarRatesSnippets,
  [pumpCrankSnippets.formulaId]: pumpCrankSnippets,
  [schweighartSedwickSnippets.formulaId]: schweighartSedwickSnippets,
}

export function getSnippets(formulaId: string): FormulaSnippet | undefined {
  return MAP[formulaId]
}
