import { useCallback, useEffect, useState } from "react";

import { postMsg } from "../core/utils";
import { Primitive, PublicSetting } from "../types";

import { TEST_SELECTED_LAYERS, TEST_PUBLIC_SETTINGS, TEST_LAYER_TYPES } from "./TEST_DATA";

type Mode = "edit" | "view" | "pending";

export default () => {
  const [mode, setMode] = useState<Mode>("pending");
  const [primitives, setPrimitives] = useState<Primitive[]>([]);
  const [publicSettings, setPublicSettings] = useState<PublicSetting[]>([]);

  useEffect(() => {
    const allPrimitives: Primitive[] = [];
    TEST_SELECTED_LAYERS.forEach(layer => {
      layer.primitives.forEach(p => {
        allPrimitives.push({
          type: TEST_LAYER_TYPES.find(lt => lt.layerId === layer.id)?.tilesType,
          ...p,
        });
      });
    });
    setPrimitives(allPrimitives); // DEV ONLY
    setPublicSettings(TEST_PUBLIC_SETTINGS); // DEV ONLY
    setMode("edit"); // DEV ONLY
  }, []);

  const handleInEditor = useCallback((inEditor: boolean) => {
    setMode(inEditor ? "edit" : "view");
  }, []);

  useEffect(() => {
    postMsg("getInEditor");
  }, []);

  const savePublicSetting = useCallback((publicSetting: PublicSetting) => {
    postMsg("savePublicSetting", publicSetting);
  }, []);

  const onMessage = useCallback(
    (e: MessageEvent<any>) => {
      if (e.source !== parent) return;
      switch (e.data.action) {
        case "getInEditor":
          handleInEditor(e.data.payload);
          break;
        default:
          break;
      }
    },
    [handleInEditor],
  );

  useEffect(() => {
    addEventListener("message", onMessage);
    return () => {
      removeEventListener("message", onMessage);
    };
  }, [onMessage]);

  return {
    mode,
    primitives,
    publicSettings,
    savePublicSetting,
  };
};
