import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { ParamsGrid } from '@/components/shared/ParamsGrid'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import { angleBetween, type Vec3 } from '@/lib/physics'
import { numParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  ax: numParam(1),
  ay: numParam(0),
  az: numParam(0),
  bx: numParam(0),
  by: numParam(1),
  bz: numParam(0),
} as const

export function VectorAngleTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)
  const res = useMemo(() => {
    const a: Vec3 = [p.ax, p.ay, p.az]
    const b: Vec3 = [p.bx, p.by, p.bz]
    const ang = angleBetween(a, b)
    if (ang == null) return null
    return { ang, deg: (ang * 180) / Math.PI }
  }, [p])

  return (
    <ToolShell
      parameters={
        <ParamsGrid variant="dense">
          <p className="col-span-full font-mono text-[10px] uppercase tracking-wide text-subtle">
            {t('fields.vector_a')}
          </p>
          <UiField
            label={t('fields.ax')}
            type="number"
            value={p.ax}
            onChange={(e) => setP({ ax: Number(e.target.value) })}
          />
          <UiField
            label={t('fields.ay')}
            type="number"
            value={p.ay}
            onChange={(e) => setP({ ay: Number(e.target.value) })}
          />
          <UiField
            label={t('fields.az')}
            type="number"
            value={p.az}
            onChange={(e) => setP({ az: Number(e.target.value) })}
          />
          <p className="col-span-full font-mono text-[10px] uppercase tracking-wide text-subtle">
            {t('fields.vector_b')}
          </p>
          <UiField
            label={t('fields.bx')}
            type="number"
            value={p.bx}
            onChange={(e) => setP({ bx: Number(e.target.value) })}
          />
          <UiField
            label={t('fields.by')}
            type="number"
            value={p.by}
            onChange={(e) => setP({ by: Number(e.target.value) })}
          />
          <UiField
            label={t('fields.bz')}
            type="number"
            value={p.bz}
            onChange={(e) => setP({ bz: Number(e.target.value) })}
          />
        </ParamsGrid>
      }
      results={
        res ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultCard
              label={t('fields.angle')}
              si={res.ang}
              category="angle"
              unitId="deg"
              unitIds={['deg', 'rad', 'mrad']}
              digits={4}
              accent
            />
          </div>
        ) : (
          <p className="font-mono text-sm text-muted">{t('fields.vectors_nonzero')}</p>
        )
      }
      code={<CodeExport formulaId="vector-angle" values={{ ax: p.ax, ay: p.ay, az: p.az, bx: p.bx, by: p.by, bz: p.bz }} />}
    />
  )
}
