import { useEffect, useState } from 'react'
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => { if (typeof window.matchMedia !== 'function') return; const query = window.matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setReduced(query.matches); query.addEventListener?.('change', update); return () => query.removeEventListener?.('change', update) }, [])
  return reduced
}
