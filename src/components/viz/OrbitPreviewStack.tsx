import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  /** 2D orbit diagram (OrbitDiagram). */
  diagram: ReactNode
  /** Optional 3D scene (OrbitScene3D). */
  scene3d?: ReactNode
  className?: string
  /**
   * @deprecated Fixed heights prevented filling the PREVIEW card.
   * Kept as optional min-height floor when the parent has no height.
   */
  diagramMinHeight?: number
}

/**
 * Stacked 2D + 3D orbit previews that fill the parent Panel
 * (100% width/height of the PREVIEW card content area).
 */
export function OrbitPreviewStack({
  diagram,
  scene3d,
  className,
  diagramMinHeight = 160,
}: Props) {
  const has3d = Boolean(scene3d)

  return (
    <div
      className={cn(
        'flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-2',
        className,
      )}
    >
      <div
        className={cn(
          'relative flex min-h-0 w-full min-w-0 flex-col overflow-hidden border border-border bg-bg',
          has3d ? 'flex-[1.15]' : 'flex-1',
        )}
        style={{ minHeight: diagramMinHeight }}
      >
        {/* In-flow pane: no absolute fill that can paint over diagram chrome */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">{diagram}</div>
      </div>
      {scene3d ? (
        <div
          className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden border border-border bg-bg"
          style={{ minHeight: diagramMinHeight }}
        >
          <div className="flex min-h-0 min-w-0 flex-1 flex-col [&_*]:min-h-0">
            {scene3d}
          </div>
        </div>
      ) : null}
    </div>
  )
}
