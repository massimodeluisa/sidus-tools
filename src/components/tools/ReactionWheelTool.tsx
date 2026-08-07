import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { wheelMomentum, wheelTorque } from '@/lib/physics'
import { numParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  I: numParam(0.05, { min: 0.0001 }),
  rpm: numParam(5000),
  alpha: numParam(1, { min: 0 }),
} as const

export function ReactionWheelTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const omega = (p.rpm * 2 * Math.PI) / 60
    const H = wheelMomentum(p.I, omega)
    const T = wheelTorque(p.I, p.alpha)
    return H != null && T != null ? { omega, H, T } : null
  }, [p])
  return (
    <ToolShell
      parameters={<ParamsGrid>
        <UiField label={t('fields.inertia_i')} type="number" value={p.I} onChange={(e) => setP({ I: Number(e.target.value) })} unit="kg·m²" />
        <UiField label={t('fields.spin_rate')} type="number" value={p.rpm} onChange={(e) => setP({ rpm: Number(e.target.value) })} unit="rpm" />
        <UiField label={t('fields.angular_accel')} type="number" value={p.alpha} onChange={(e) => setP({ alpha: Number(e.target.value) })} unit="rad/s²" />
      </ParamsGrid>}
      results={res ? <div className="grid gap-3 sm:grid-cols-2">
        <ResultCard label={t('fields.momentum_h_i')} value={res.H.toFixed(4)} unit="N·m·s" accent />
        <ResultCard label={t('fields.torque_t_i')} value={res.T.toFixed(4)} unit="N·m" />
        <ResultCard label={t('fields.f__3')} value={res.omega.toFixed(2)} unit="rad/s" />
      </div> : <p className="font-mono text-sm text-muted">{t('fields.invalid_wheel_inputs')}</p>}
      code={<CodeExport formulaId="reaction-wheel" values={{ I: p.I, rpm: p.rpm, alpha: p.alpha }} />}
    />
  )
}
