import { useEffect } from "react";

export default <T>(
  isInitialized: boolean,
  url: string | undefined,
  runningClient: T,
  initializeClient: (url: string, token?: string) => void,
  token?: string,
) => {
  useEffect(() => {
    if (isInitialized) return;
    if (!runningClient && url) {
      initializeClient(url, token);
    }
  }, [isInitialized, url, runningClient, token, initializeClient]);
};
