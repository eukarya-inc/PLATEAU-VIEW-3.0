import { useCallback, useEffect, useState } from "react";

import { postMsg } from "../../../utils";

export type Tab = "basic" | "map" | "shadow" | "clip";

type Items = {
  label: string;
  key: Tab;
};

const items: Items[] = [
  { label: "基本操作", key: "basic" },
  { label: "マップを使ってみる", key: "map" },
  { label: "日影機能について", key: "shadow" },
  { label: "クリップ機能", key: "clip" },
];

export default () => {
  const [selectedTab, changeTab] = useState<Tab>("basic");

  useEffect(() => {
    postMsg({ action: "popup-message", payload: selectedTab });
  }, []);

  useEffect(() => {
    const eventListenerCallback = (e: any) => {
      if (e.source !== parent) return null;
      if (e.data.type) {
        if (e.data.type === "popup-message-init") {
          postMsg({ action: "popup-message", payload: selectedTab });
        }
      }
    };
    (globalThis as any).addEventListener("message", (e: any) => eventListenerCallback(e));
    return () => {
      (globalThis as any).removeEventListener("message", eventListenerCallback);
    };
  });

  const handleItemClicked = useCallback((key: Tab) => {
    changeTab(key);
    postMsg({ action: "popup-message", payload: key });
    postMsg({ action: "show-popup" });
  }, []);

  return {
    items,
    selectedTab,
    handleItemClicked,
  };
};
