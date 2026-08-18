import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ToolShell } from '@/components/shared/ToolShell'
import { UiField } from '@/components/shared/UiField'
import { ResultCard } from '@/components/shared/ResultCard'
import { CodeExport } from '@/components/shared/CodeExport'
import {
  BODIES,
  escapeVelocity,
  G0,
  localGravity,
  TOOL_UNIT_SETS,
  type Body,
} from '@/lib/physics'
import {
  formatNumber,
} from '@/lib/physics/format'
import { cn } from '@/lib/utils'
import { strParam, useToolSearchParams } from '@/lib/useToolSearchParams'

const SCHEMA = {
  id: strParam(
    'earth',
    BODIES.map((b) => b.id),
  ),
  q: strParam(''),
} as const

export function BodiesTool() {
  const { t } = useTranslation()
  const [p, setP] = useToolSearchParams(SCHEMA)

  const filtered = useMemo(() => {
    const query = p.q.trim().toLowerCase()
    if (!query) return BODIES
    return BODIES.filter(
      (b) =>
        b.name.toLowerCase().includes(query) ||
        b.id.includes(query) ||
        b.type.includes(query),
    )
  }, [p.q])

  const body: Body =
    BODIES.find((b) => b.id === p.id) ?? BODIES.find((b) => b.id === 'earth')!
  const g = localGravity(body.mu, body.radius)
  const vesc = escapeVelocity(body.mu, body.radius)

  return (
    <ToolShell
      parameters={
        // Stacked layout (not ParamsGrid auto-fill): search + full-width body list.
        <div className="flex min-w-0 flex-col gap-3">
          <UiField
            label={t('fields.search')}
            type="search"
            value={p.q}
            onChange={(e) => setP({ q: e.target.value })}
            placeholder={t('fields.placeholder_bodies')}
            reserveHint={false}
          />
          <ul className="flex max-h-[min(420px,55vh)] w-full min-w-0 flex-col gap-0.5 overflow-auto border border-border bg-bg p-1">
            {filtered.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => setP({ id: b.id })}
                  className={cn(
                    'flex w-full items-center gap-3 border px-3 py-2.5 text-left transition-colors',
                    p.id === b.id
                      ? 'border-border-strong bg-surface'
                      : 'border-transparent hover:bg-surface/50',
                  )}
                >
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: b.color }}
                    aria-hidden
                  />
                  <span className="flex min-w-0 flex-col">
                    <span className="font-display text-sm text-fg">{b.name}</span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-subtle">
                      {b.type}
                    </span>
                  </span>
                </button>
              </li>
            ))}
            {filtered.length === 0 ? (
              <li className="px-3 py-4 font-mono text-xs text-muted">{t('fields.no_bodies_match')}</li>
            ) : null}
          </ul>
        </div>
      }
      results={
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span
              className="size-4 rounded-full"
              style={{ background: body.color }}
              aria-hidden
            />
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
              {body.name} · {body.type}
            </span>
          </div>
          <div className="sidus-results">
            <ResultCard
              label={t('fields.gravitational_parameter')}
              value={formatNumber(body.mu, 5)}
              unit="m³/s²"
              accent
            />
            <ResultCard
              label={t('fields.mean_radius')}
              si={body.radius}
              category="length"
              unitId="km"
              unitIds={TOOL_UNIT_SETS.length}
              digits={2}
            />
            <ResultCard
              label={t('fields.mass')}
              si={body.mass}
              category="mass"
              unitId="kg"
              unitIds={TOOL_UNIT_SETS.mass}
              digits={4}
            />
            <ResultCard
              label={t('fields.surface_g')}
              si={g}
              category="accel"
              unitId="mps2"
              unitIds={['mps2', 'g']}
              digits={4}
            />
            <ResultCard label={t('fields.g_g')} value={formatNumber(g / G0, 4)} />
            <ResultCard
              label={t('fields.surface_escape')}
              si={vesc}
              category="velocity"
              unitId="kmps"
              unitIds={TOOL_UNIT_SETS.velocity}
              digits={4}
            />
            {body.soi != null ? (
              <ResultCard
                label={t('fields.sphere_of_influence_approx')}
                si={body.soi}
                category="length"
                unitId="km"
                unitIds={TOOL_UNIT_SETS.length}
                digits={1}
              />
            ) : null}
          </div>
          <p className="font-mono text-[10px] leading-relaxed text-subtle">
            {t('fields.note_bodies_ref')}
          </p>
        </div>
      }
      code={<CodeExport formulaId="bodies" values={{ mu: body.mu, R: body.radius, id: p.id, q: p.q }} />}
    />
  )
}
