import { useEffect } from "react";

export default <T>(
  isInitialized: boolean,
  environmentValue: T | undefined,
  cachedValue: T,
  setCachedValue: (value: T) => void,
) => {
  useEffect(() => {
    if (isInitialized) return;
    if (environmentValue && (!cachedValue || environmentValue !== cachedValue)) {
      setCachedValue(environmentValue);
    }
  }, [isInitialized, cachedValue, environmentValue, setCachedValue]);
};
