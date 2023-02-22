import { useCallback, useEffect, useState, useRef } from "react";

import { postMsg } from "../core/utils";
import { Feature, Fields } from "../types";

type Mode = "edit" | "view" | "pending";

export default () => {
  const [mode, setMode] = useState<Mode>("pending");
  const [dataState, setDataState] = useState<"loading" | "empty" | "ready">("loading");
  const [feature, setFeature] = useState<Feature>();
  const [fields, setFields] = useState<Fields>();
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleInEditor = useCallback((inEditor: boolean) => {
    setMode(inEditor ? "edit" : "view");
  }, []);

  const handleFillData = useCallback((data: { feature: Feature; fields: Fields }) => {
    setFeature(data.feature);
    if (data.fields) {
      setFields(data.fields);
    }
    setDataState("ready");
  }, []);

  const saveFields = useCallback((fields: Fields) => {
    setIsSaving(true);
    postMsg("saveFields", fields);
  }, []);

  const onMessage = useCallback(
    (e: MessageEvent<any>) => {
      if (e.source !== parent) return;
      switch (e.data.action) {
        case "getInEditor":
          handleInEditor(e.data.payload);
          break;
        case "fillData":
          handleFillData(e.data.payload);
          break;
        case "setLoading":
          setDataState("loading");
          break;
        case "setEmpty":
          setDataState("empty");
          break;
        case "saveFinish":
          setIsSaving(false);
          break;
        default:
          break;
      }
    },
    [handleInEditor, handleFillData],
  );

  const wrapperRef = useRef<HTMLDivElement>(null);
  const updateSize = useCallback(() => {
    if (wrapperRef.current) {
      document.documentElement.style.height = `${wrapperRef.current.clientHeight}px`;
    }
  }, []);

  useEffect(() => {
    addEventListener("message", onMessage);
    return () => {
      removeEventListener("message", onMessage);
    };
  }, [onMessage]);

  useEffect(() => {
    postMsg("init");
  }, []);

  return {
    mode,
    dataState,
    feature,
    fields,
    wrapperRef,
    isSaving,
    saveFields,
    updateSize,
  };
};
