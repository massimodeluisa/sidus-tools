import { useEffect, useRef, useState } from 'react'

/** Animate integer count when element enters viewport. */
export function useCountUpWhenVisible(target: number, durationMs = 900): {
  ref: React.RefObject<HTMLElement | null>
  value: number
} {
  const ref = useRef<HTMLElement | null>(null)
  const [value, setValue] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || started.current) return
        started.current = true
        const t0 = performance.now()
        const from = 0
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / durationMs)
          const eased = 1 - (1 - p) ** 3
          setValue(Math.round(from + (target - from) * eased))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        io.disconnect()
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [target, durationMs])

  return { ref, value }
}
