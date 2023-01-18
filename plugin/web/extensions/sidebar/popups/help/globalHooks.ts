import { postMsg } from "@web/extensions/sidebar/core/utils";
import { useCallback, useEffect, useState } from "react";

import { Tab } from "../../core/components/content/Help/hooks";

export default () => {
  const [currentPopup, setCurrentPopup] = useState<Tab>();

  useEffect(() => {
    postMsg({ action: "popup-message-init" });
  }, []);

  const handleClosePopup = useCallback(() => {
    postMsg({ action: "close-popup" });
  }, []);

  const handleShowMapModal = useCallback(() => {
    postMsg({ action: "show-map-modal" });
  }, []);

  const handleShowClipModal = useCallback(() => {
    postMsg({ action: "show-clip-modal" });
  }, []);

  useEffect(() => {
    const eventListenerCallback = (e: any) => {
      if (e.source !== parent) return null;
      if (e.data.type) {
        if (e.data.type === "msgFromHelp" && e.data.message) {
          setCurrentPopup(e.data.message);
        }
      }
    };
    (globalThis as any).addEventListener("message", (e: any) => eventListenerCallback(e));
    return () => {
      (globalThis as any).removeEventListener("message", eventListenerCallback);
    };
  });

  return {
    currentPopup,
    handleClosePopup,
    handleShowMapModal,
    handleShowClipModal,
  };
};
