import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

type Props = {
  children: ReactNode
  className?: string
  /** Stagger delay in ms when parent reveals */
  delayMs?: number
  /** Once visible, stay (default true) */
  once?: boolean
}

/**
 * Fade/rise on scroll intersection. Respects prefers-reduced-motion via CSS.
 */
export function RevealOnScroll({
  children,
  className,
  delayMs = 0,
  once = true,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true)
            if (once) io.disconnect()
          } else if (!once) {
            setVisible(false)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [once])

  const style = {
    '--sidus-reveal-delay': `${delayMs}ms`,
  } as CSSProperties

  return (
    <div
      ref={ref}
      style={style}
      className={cn(
        'sidus-reveal',
        visible && 'sidus-reveal-visible',
        className,
      )}
    >
      {children}
    </div>
  )
}
