import { useCallback } from "react";

import { GeoidServer } from "../types/reearthPluginAPIv2/common";
import { isReEarthAPIv2 } from "../utils/reearth";

export const useViewer = () => {
  const setGeoidServer = useCallback((params: GeoidServer) => {
    if (isReEarthAPIv2(window.reearth)) {
      window.reearth?.viewer?.tools?.setGeoidServer(params);
    }
  }, []);

  const getGeoidHeight = useCallback((lng?: number, lat?: number) => {
    if (isReEarthAPIv2(window.reearth)) {
      return window.reearth?.viewer?.tools?.getGeoidHeight(lng, lat);
    }
  }, []);

  return {
    setGeoidServer,
    getGeoidHeight,
  };
};
