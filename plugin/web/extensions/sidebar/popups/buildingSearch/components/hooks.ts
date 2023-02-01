import { useCallback, useEffect, useState, useRef } from "react";

import { postMsg } from "../../../utils";
import type { DatasetIndexes, Condition, Result, Viewport } from "../types";

import { TEST_DATASET_INDEX_DATA, TEST_RESULT_DATA } from "./TEST_DATA";

export type Size = {
  width: number;
  height: number;
};

export default () => {
  // UI
  const [minimized, setMinimized] = useState<boolean>(false);
  const [sizes, setSizes] = useState<{ default: Size; mobile: Size; mini: Size }>({
    default: {
      width: 347,
      height: 524,
    },
    mobile: {
      width: 0,
      height: 524,
    },
    mini: {
      width: 238,
      height: 82,
    },
  });
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [size, setSize] = useState<Size>(sizes.default);
  const prevSizeRef = useRef<Size>(size);

  const toggleMinimize = useCallback(() => {
    prevSizeRef.current = size;
    setMinimized(!minimized);
  }, [minimized, size]);

  const setHtmlSize = useCallback((size: Size) => {
    document.documentElement.style.width = `${size.width}px`;
    document.documentElement.style.height = `${size.height}px`;
  }, []);

  useEffect(() => {
    const targetSize = minimized ? sizes.mini : isMobile ? sizes.mobile : sizes.default;
    setSize(targetSize);
    if (
      targetSize.width >= prevSizeRef.current.width ||
      targetSize.height >= prevSizeRef.current.height
    ) {
      setHtmlSize(targetSize);
    } else {
      setTimeout(() => {
        setHtmlSize(targetSize);
      }, 500);
    }
  }, [minimized, sizes, isMobile, setHtmlSize]);

  const handleResize = useCallback(
    (viewport: Viewport) => {
      if (viewport.isMobile) {
        setIsMobile(true);
        setSizes({
          ...sizes,
          mobile: { width: viewport.width * 0.9, height: sizes.mobile.height },
        });
      } else if (isMobile) {
        setIsMobile(false);
      }
    },
    [sizes, isMobile],
  );

  const [activeTab, setActiveTab] = useState<"condition" | "result">("condition");
  const onClickCondition = useCallback(() => {
    setActiveTab("condition");
  }, []);
  const onClickResult = useCallback(() => {
    setActiveTab("result");
  }, []);

  // Data
  const [datasetIndexes, setDatasetIndexes] = useState<DatasetIndexes>();
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [highlightAll, setHighlightAll] = useState<boolean>(true);
  const [showMatchingOnly, setShowMatchingOnly] = useState<boolean>(false);
  const [selected, setSelected] = useState<string[]>([]);

  const conditionApply = useCallback(() => {
    // TODO: Search logic here
    console.log(conditions);
    const computeResult = TEST_RESULT_DATA;

    setResults(computeResult);
    setActiveTab("result");
    setHighlightAll(true);
    setShowMatchingOnly(false);
  }, [conditions]);

  useEffect(() => {
    // TODO: flyTo the selected building
    if (selected.length === 1) {
      postMsg({
        action: "cameraFlyTo",
        payload: [
          {
            lng: 137.31210397018728,
            lat: 34.60832876429294,
            height: 54735.3396536646,
            heading: 0.06105070089725917,
            pitch: -0.8254743840751195,
            roll: 6.283184517370357,
            fov: 1.0471975511965976,
          },
          { duration: 2 },
        ],
      });
    }
  }, [selected]);

  useEffect(() => {
    // TODO: flyTo the result if only one
    if (results.length === 1) {
      postMsg({
        action: "cameraFlyTo",
        payload: [
          {
            lng: 137.31210397018728,
            lat: 34.60832876429294,
            height: 54735.3396536646,
            heading: 0.06105070089725917,
            pitch: -0.8254743840751195,
            roll: 6.283184517370357,
            fov: 1.0471975511965976,
          },
          { duration: 2 },
        ],
      });
    }
  }, [results]);

  useEffect(() => {
    // TODO: Update 3D tiles style
  }, [highlightAll, showMatchingOnly, selected, results]);

  const popupClose = useCallback(() => {
    postMsg({ action: "popupClose" });
  }, []);

  useEffect(() => {
    if ((window as any).buildingSearchInit) {
      const init = (window as any).buildingSearchInit;
      if (init.viewport.isMobile) {
        setIsMobile(true);
        setSizes({
          ...sizes,
          mobile: { width: init.viewport.width * 0.9, height: sizes.mobile.height },
        });
      }
    }

    document.documentElement.style.setProperty("--theme-color", "#00BEBE");

    const datasetIndexes = ((window as any).buildingSearchInit?.data ??
      TEST_DATASET_INDEX_DATA) as DatasetIndexes;

    setDatasetIndexes(datasetIndexes);
    setConditions(datasetIndexes.indexes.map(index => ({ field: index.field, values: [] })));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onMessage = useCallback(
    (e: MessageEvent<any>) => {
      if (e.source !== parent) return;
      switch (e.data.type) {
        case "resize":
          handleResize(e.data.payload);
          break;
        default:
          break;
      }
    },
    [handleResize],
  );

  useEffect(() => {
    addEventListener("message", onMessage);
    return () => {
      removeEventListener("message", onMessage);
    };
  }, [onMessage]);

  return {
    size,
    minimized,
    activeTab,
    datasetIndexes,
    results,
    highlightAll,
    showMatchingOnly,
    selected,
    onClickCondition,
    onClickResult,
    toggleMinimize,
    popupClose,
    setConditions,
    conditionApply,
    setHighlightAll,
    setShowMatchingOnly,
    setSelected,
  };
};
