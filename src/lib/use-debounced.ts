import { useEffect, useState } from 'react'

/**
 * Return `value` after it has stayed unchanged for `ms`.
 * The first render is immediate so a shared link does not wait to search.
 */
export function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), ms)
    return () => window.clearTimeout(id)
  }, [value, ms])
  return debounced
}
