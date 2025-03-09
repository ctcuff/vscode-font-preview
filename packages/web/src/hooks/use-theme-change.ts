import { WebviewMessage } from '@font-preview/shared';
import { useCallback, useEffect } from 'react';

/**
 * Runs a callback when when vscode's theme changes
 */
const useThemeChange = (callback: () => void): void => {
  const onMessage = useCallback(
    (message: MessageEvent<WebviewMessage>) => {
      if (message.data.type === 'COLOR_THEME_CHANGE') {
        callback();
      }
    },
    [callback]
  );

  useEffect(() => {
    window.addEventListener('message', onMessage);

    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, [onMessage]);
};

export default useThemeChange;
