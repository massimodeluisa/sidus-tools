import { useTranslation } from 'react-i18next'
import { FieldPresets, PresetChip } from '@/components/shared/Field'
import { tooltipProps } from '@/components/shared/tooltip'
import {
  LAUNCH_SITES,
  matchLaunchSite,
  type GeoSite,
} from '@/lib/physics'

type Props = {
  /** Apply site lat/lon/height (and any tool-specific extras). */
  onSelect: (site: GeoSite) => void
  /** Current site coordinates for active chip highlight. */
  latDeg?: number
  lonDeg?: number
  className?: string
  /** Override the presets row label (default: "Launch sites"). */
  label?: string
}

/**
 * Preset chips for major orbital launch ranges (shared across ground-site tools).
 */
export function LaunchSitePresets({ onSelect, latDeg, lonDeg, className, label }: Props) {
  const { t } = useTranslation()
  const active =
    latDeg != null && lonDeg != null
      ? matchLaunchSite(latDeg, lonDeg)
      : latDeg != null
        ? LAUNCH_SITES.find((s) => Math.abs(s.latDeg - latDeg) <= 0.08)
        : undefined

  return (
    <FieldPresets label={label ?? t('common.launch_sites')} className={className}>
      {LAUNCH_SITES.map((site) => (
        <PresetChip
          key={site.id}
          type="button"
          {...tooltipProps(site.name)}
          active={active?.id === site.id}
          onClick={() => onSelect(site)}
        >
          {site.label}
          <span className="sr-only">{site.name}</span>
        </PresetChip>
      ))}
    </FieldPresets>
  )
}
