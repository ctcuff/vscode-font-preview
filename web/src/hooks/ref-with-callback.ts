import { useRef, useCallback, DependencyList } from 'react'

type MountCallback<T> = (node: T) => void

/**
 * A utility hook that allows you to create a ref for a React Element and
 * listen for mount events for that element.
 */
function useRefWithCallback<T>(
  onMount: MountCallback<T>,
  dependencyList?: DependencyList[]
): (ref: T | null) => void {
  const ref = useRef<T | null>(null)

  const setRef = useCallback((node: T | null) => {
    ref.current = node

    if (ref.current) {
      onMount(ref.current)
    }
  }, dependencyList ?? [onMount])

  return setRef
}

export default useRefWithCallback
