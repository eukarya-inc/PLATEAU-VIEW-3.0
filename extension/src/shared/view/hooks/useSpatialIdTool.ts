import { useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect, useRef } from "react";

import { spatialIdZoomAtom, toolAtom } from "../../../prototypes/view/states/tool";
import { useReEarthEvent } from "../../reearth/hooks";
import { useSpatialId } from "../../reearth/hooks/useSpatialId";

export default () => {
  const [toolType] = useAtom(toolAtom);
  const spatialIdZoom = useAtomValue(spatialIdZoomAtom);
  const { handlePickSpace, handleExitPickSpace } = useSpatialId();

  const zoomRef = useRef(spatialIdZoom);
  zoomRef.current = spatialIdZoom;
  const toolTypeRef = useRef(toolType?.type);
  toolTypeRef.current = toolType?.type;
  const handlePickSpaceRef = useRef(handlePickSpace);
  handlePickSpaceRef.current = handlePickSpace;
  const handleExitPickSpaceRef = useRef(handleExitPickSpace);
  handleExitPickSpaceRef.current = handleExitPickSpace;

  const startPickSpace = useCallback(() => {
    handlePickSpaceRef.current({
      zoom: zoomRef.current,
      rightClickToExit: false,
    });
  }, []);
  const startPickSpaceRef = useRef(startPickSpace);
  startPickSpaceRef.current = startPickSpace;

  useEffect(() => {
    if (tempSwitchToMoveMode.current) return;
    if (toolType?.type === "spatialId") {
      startPickSpaceRef.current();
    }
  }, [toolType?.type]);

  useEffect(() => {
    if (toolTypeRef.current === "spatialId") {
      handleExitPickSpaceRef.current();
      startPickSpaceRef.current();
    }
  }, [spatialIdZoom]);

  const handleSpatialIdSpacePick = useCallback(() => {
    startPickSpaceRef.current();
  }, []);

  useReEarthEvent("spatialidspacepick", handleSpatialIdSpacePick);

  const tempSwitchToMoveMode = useRef(false);
  useEffect(() => {
    return window.addEventListener("keydown", e => {
      if (e.code === "Space") {
        tempSwitchToMoveMode.current = true;
      }
    });
  }, []);

  useEffect(() => {
    return window.addEventListener("keyup", () => {
      if (tempSwitchToMoveMode.current === true) {
        tempSwitchToMoveMode.current = false;
      }
    });
  }, []);
};
