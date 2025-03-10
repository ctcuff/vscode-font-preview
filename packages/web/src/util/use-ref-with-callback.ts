import { useCallback, useRef } from 'react';

type MountCallback<T extends HTMLElement> = (node: T) => void;
type UseRefWithCallback<T extends HTMLElement> = (node: T | null) => void;

/**
 * A utility hook that allows you to create a ref for a React Element and
 * run a callback when that element mounts
 */
function useRefWithCallback<T extends HTMLElement>(
  onMount: MountCallback<T>
): UseRefWithCallback<T> {
  const ref = useRef<T | null>(null);

  const setRef = useCallback(
    (node: T | null) => {
      ref.current = node;

      if (ref.current) {
        onMount(ref.current);
      }
    },
    // Disabled because eslint wants 'T' as a dependency. This is probably
    // fixed in a newer version.
    // https://github.com/typescript-eslint/typescript-eslint/issues/2476
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onMount]
  );

  return setRef;
}

export default useRefWithCallback;
