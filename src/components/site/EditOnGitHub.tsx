import { useTranslation } from 'react-i18next'
import { tooltipProps } from '@/components/shared/tooltip'

const REPO = 'https://github.com/massimodeluisa/sidus-tools'
const BRANCH = 'main'

type Props = {
  /** Path relative to repo root, e.g. src/components/tools/HohmannTool.tsx */
  path: string
  className?: string
}

/**
 * Supabase-docs style “Edit this page on GitHub” affordance.
 */
export function EditOnGitHub({ path, className = '' }: Props) {
  const { t } = useTranslation()
  const href = `${REPO}/edit/${BRANCH}/${path.replace(/^\//, '')}`
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      {...tooltipProps(
        t('tool.edit_github'),
        `inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle transition-colors hover:text-signal ${className}`,
      )}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden
        className="opacity-80"
      >
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
      </svg>
      {t('tool.edit_github')}
    </a>
  )
}

/** Map tool id → primary implementation path for edit links */
export function toolSourcePath(toolId: string): string {
  const MAP: Record<string, string> = {
    'circular-orbit': 'src/components/tools/CircularOrbitTool.tsx',
    hohmann: 'src/components/tools/HohmannTool.tsx',
    escape: 'src/components/tools/EscapeTool.tsx',
    bielliptic: 'src/components/tools/BiellipticTool.tsx',
    'plane-change': 'src/components/tools/PlaneChangeTool.tsx',
    'vis-viva': 'src/components/tools/VisVivaTool.tsx',
    'kepler-propagate': 'src/components/tools/KeplerPropagateTool.tsx',
    lambert: 'src/components/tools/LambertTool.tsx',
    'rv-elements': 'src/components/tools/RvElementsTool.tsx',
    apsides: 'src/components/tools/ApsidesTool.tsx',
    sgp4: 'src/components/tools/Sgp4Tool.tsx',
    'look-angles': 'src/components/tools/LookAnglesTool.tsx',
    'pass-predict': 'src/components/tools/PassPredictTool.tsx',
    'j2-drift': 'src/components/tools/J2DriftTool.tsx',
    'rocket-equation': 'src/components/tools/RocketEquationTool.tsx',
    'multi-stage': 'src/components/tools/MultiStageTool.tsx',
    plotter: 'src/components/tools/PlotterTool.tsx',
    units: 'src/components/tools/UnitsTool.tsx',
    bodies: 'src/components/tools/BodiesTool.tsx',
    'launch-azimuth': 'src/components/tools/LaunchAzimuthTool.tsx',
    sso: 'src/components/tools/SsoTool.tsx',
    'dynamic-pressure': 'src/components/tools/DynamicPressureTool.tsx',
    'cw-rendezvous': 'src/components/tools/CwRendezvousTool.tsx',
    'link-budget': 'src/components/tools/LinkBudgetTool.tsx',
    phasing: 'src/components/tools/PhasingTool.tsx',
    'metabolic-load': 'src/components/tools/MetabolicLoadTool.tsx',
    'cabin-atmosphere': 'src/components/tools/CabinAtmosphereTool.tsx',
    'lioh-scrubber': 'src/components/tools/LiohScrubberTool.tsx',
    'cabin-leak': 'src/components/tools/CabinLeakTool.tsx',
    'thermal-loop': 'src/components/tools/ThermalLoopTool.tsx',
    'custom-body': 'src/components/tools/CustomBodyTool.tsx',
    'hyperbolic-c3': 'src/components/tools/HyperbolicC3Tool.tsx',
    'hohmann-plane': 'src/components/tools/HohmannPlaneTool.tsx',
    'propellant-mass': 'src/components/tools/PropellantMassTool.tsx',
    'ideal-thrust': 'src/components/tools/IdealThrustTool.tsx',
    soi: 'src/components/tools/SoiTool.tsx',
    'synodic-period': 'src/components/tools/SynodicPeriodTool.tsx',
    'eclipse-duration': 'src/components/tools/EclipseDurationTool.tsx',
    'light-time': 'src/components/tools/LightTimeTool.tsx',
    'solar-pressure': 'src/components/tools/SolarPressureTool.tsx',
    'ballistic-drag': 'src/components/tools/BallisticDragTool.tsx',
    circularize: 'src/components/tools/CircularizeTool.tsx',
    'geo-orbit': 'src/components/tools/GeoOrbitTool.tsx',
    'delta-a-burn': 'src/components/tools/DeltaABurnTool.tsx',
    'plane-change-apo': 'src/components/tools/PlaneChangeApoTool.tsx',
    'delta-v-budget': 'src/components/tools/DeltaVBudgetTool.tsx',
    'heat-flux': 'src/components/tools/HeatFluxTool.tsx',
    coelliptic: 'src/components/tools/CoellipticTool.tsx',
    'los-range-rate': 'src/components/tools/LosRangeRateTool.tsx',
    oberth: 'src/components/tools/OberthTool.tsx',
    'horizon-range': 'src/components/tools/HorizonRangeTool.tsx',
    'antenna-beamwidth': 'src/components/tools/AntennaBeamwidthTool.tsx',
    deorbit: 'src/components/tools/DeorbitTool.tsx',
    'equal-stage': 'src/components/tools/EqualStageTool.tsx',
    'mean-motion': 'src/components/tools/MeanMotionTool.tsx',
    'solar-array': 'src/components/tools/SolarArrayTool.tsx',
    'battery': 'src/components/tools/BatteryTool.tsx',
    'rcs': 'src/components/tools/RcsTool.tsx',
    'angular-diameter': 'src/components/tools/AngularDiameterTool.tsx',
    'diffraction': 'src/components/tools/DiffractionTool.tsx',
    'thermal-rad': 'src/components/tools/ThermalRadTool.tsx',
    'drag-force': 'src/components/tools/DragForceTool.tsx',
    'reaction-wheel': 'src/components/tools/ReactionWheelTool.tsx',
    'apo-raise': 'src/components/tools/ApoRaiseTool.tsx',
    'ground-track': 'src/components/tools/GroundTrackTool.tsx',
    'along-track': 'src/components/tools/AlongTrackTool.tsx',
    'period-match': 'src/components/tools/PeriodMatchTool.tsx',
    'eclipse-beta': 'src/components/tools/EclipseBetaTool.tsx',
    'hohmann-time': 'src/components/tools/HohmannTimeTool.tsx',
    'orbital-energy': 'src/components/tools/EnergyTool.tsx',
    'true-anomaly': 'src/components/tools/TrueAnomalyTool.tsx',
    'flyby-speed': 'src/components/tools/FlybySpeedTool.tsx',
    'nodal-period': 'src/components/tools/NodalPeriodTool.tsx',
    'eccentric-anomaly': 'src/components/tools/EccentricAnomalyTool.tsx',
    'scale-height': 'src/components/tools/ScaleHeightTool.tsx',
    'rendezvous-catchup': 'src/components/tools/RendezvousPhasingSimpleTool.tsx',
    'impulse-budget': 'src/components/tools/ImpulseBitBudgetTool.tsx',
    'sso-period': 'src/components/tools/SunSyncPeriodTool.tsx',
    'mass-ratio-stack': 'src/components/tools/MassRatioStagesTool.tsx',
    'critical-inclination': 'src/components/tools/CriticalInclinationTool.tsx',
    'relative-period': 'src/components/tools/RelativePeriodTool.tsx',
    'energy-vinf': 'src/components/tools/HyperbolicExcessFromEnergyTool.tsx',
    'geo-light-time': 'src/components/tools/CommDelayGeoTool.tsx',
    'payload-fraction': 'src/components/tools/PayloadFractionTool.tsx',
    'specific-angular-momentum': 'src/components/tools/SpecificAngularMomentumTool.tsx',
    'escape-margin': 'src/components/tools/EnergyMarginTool.tsx',
    'molniya-tundra': 'src/components/tools/MolniyaTundraTool.tsx',
    'frozen-orbit': 'src/components/tools/FrozenOrbitTool.tsx',
    'thrust-to-weight': 'src/components/tools/ThrustToWeightTool.tsx',
    'planck-radiance': 'src/components/tools/PlanckRadianceTool.tsx',
    'eirp-gt': 'src/components/tools/EirpGtTool.tsx',
    'quaternion-euler': 'src/components/tools/QuaternionEulerTool.tsx',
    'porkchop-earth-mars': 'src/components/tools/PorkchopEarthMarsTool.tsx',
    'conjunction-pc': 'src/components/tools/ConjunctionPcTool.tsx',
    'b-plane-target': 'src/components/tools/BPlaneTargetTool.tsx',
    'quest-attitude': 'src/components/tools/QuestAttitudeTool.tsx',
    'herrick-gibbs': 'src/components/tools/HerrickGibbsTool.tsx',
    'lunisolar-rates': 'src/components/tools/LunisolarRatesTool.tsx',
    'pump-crank': 'src/components/tools/PumpCrankTool.tsx',
    'schweighart-sedwick': 'src/components/tools/SchweighartSedwickTool.tsx',
  }
  return MAP[toolId] ?? 'src/data/tools.ts'
}
