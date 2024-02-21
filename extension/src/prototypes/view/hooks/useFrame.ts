import { useEffect, useRef, useState } from "react";

export const useFrame = (cb: () => void) => {
  const [shouldStart, setShouldStart] = useState(false);
  const isCanceled = useRef(false);
  isCanceled.current = !shouldStart;

  useEffect(() => {
    let timer: number;
    const animate = () => {
      if (isCanceled.current) return;
      cb();
      if (shouldStart) timer = requestAnimationFrame(animate);
    };
    timer = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(timer);
  }, [cb, shouldStart]);
  return { start: () => setShouldStart(true), stop: () => setShouldStart(false) };
};
