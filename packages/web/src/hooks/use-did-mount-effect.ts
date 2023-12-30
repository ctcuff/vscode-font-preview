import { useEffect, useRef, EffectCallback, DependencyList } from 'react'

/**
 * Similar to `useEffect` except the callback function doesn't get called on mount
 */
const useDidMountEffect = (effect: EffectCallback, deps?: DependencyList): void => {
  const didMount = useRef(false)

  useEffect(() => {
    if (didMount.current) {
      effect()
    } else {
      didMount.current = true
    }
  }, deps)
}

export default useDidMountEffect
