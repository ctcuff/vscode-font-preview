import { useRef, useCallback } from 'react'

type MountCallback<T> = (node: T) => void

/**
 * A utility hook that allows you to create a ref for a React Element and
 * listen for mount and unmount events for that element.
 */
function useRefWithCallback<T>(
  onMount: MountCallback<T>,
  onUnmount: MountCallback<T> = () => {}
): (ref: T | null) => void {
  const ref = useRef<T | null>(null)

  const setRef = useCallback(
    (node: T | null) => {
      if (ref.current) {
        onUnmount(ref.current)
      }

      ref.current = node

      if (ref.current) {
        onMount(ref.current)
      }
    },
    [onMount, onUnmount]
  )

  return setRef
}

export default useRefWithCallback
