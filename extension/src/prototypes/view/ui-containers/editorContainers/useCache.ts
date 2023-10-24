import { useRef, useCallback, useMemo } from "react";

export type EditorCache = {
  get: (id: string) => any;
  set: (id: string, content: any) => void;
  remove: (id: string) => void;
};

export default () => {
  const editorCache = useRef<Record<string, any>>({});

  const set = useCallback((id: string, content: any) => {
    editorCache.current[id] = content;
  }, []);

  const get = useCallback((id: string) => {
    return editorCache.current[id];
  }, []);

  const remove = useCallback((id: string) => {
    delete editorCache.current[id];
  }, []);

  const cache: EditorCache = useMemo(
    () => ({
      get,
      set,
      remove,
    }),
    [get, set, remove],
  );

  return cache;
};
