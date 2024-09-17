import { useAtomValue } from "jotai";
import { useState, useEffect } from "react";

import { readyAtom } from "../../prototypes/view/states/app";
import {
  isEnableAtom,
  contentAtom,
  startTimeAtom,
  finishTimeAtom,
} from "../../shared/states/environmentVariables";

// Function to generate a hash from content
async function generateContentId(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

export const useNotificationLogic = () => {
  const ready = useAtomValue(readyAtom);
  const [visible, setVisible] = useState(true);
  const [doNotShowAgain, setDoNotShowAgain] = useState<boolean>(false);
  const [show, setShow] = useState<boolean>(false);

  const isEnable = useAtomValue(isEnableAtom);
  const content = useAtomValue(contentAtom);
  const startTime = useAtomValue(startTimeAtom);
  const finishTime = useAtomValue(finishTimeAtom);

  const [contentId, setContentId] = useState<string | null>(null);

  useEffect(() => {
    const updateContentId = async () => {
      if (content) {
        const newContentId = await generateContentId(content);
        setContentId(newContentId);

        const storedDoNotShowAgain = localStorage.getItem("PLATEAUVIEW3_STORAGE_NOTIFICATION_DO_NOT_SHOW_AGAIN");
        const storedContentID = localStorage.getItem("PLATEAUVIEW3_STORAGE_NOTIFICATION_CONTENT_ID");

        if (storedDoNotShowAgain === "true" && storedContentID === newContentId) {
          setVisible(false);
          return;
        }
      }
    };
    updateContentId();
  }, [content]);

  useEffect(() => {
    // Get the current time and convert it to UTC
    const nowUTC = new Date().getTime();
    // Convert `startTime` and `finishTime` to UTC
    const startTimeUTC = startTime ? new Date(startTime).getTime() : null;
    const finishTimeUTC = finishTime ? new Date(finishTime).getTime() : null;

    // Check display conditions
    if (isEnable) {
      if (!startTimeUTC && !finishTimeUTC) {
        // If neither is set, always show
        setShow(true);
      } else if (startTimeUTC && !finishTimeUTC) {
        // If only `startTime` is set, show if current time is after `startTime`
        setShow(nowUTC >= startTimeUTC);
      } else if (!startTimeUTC && finishTimeUTC) {
        // If only `finishTime` is set, show if current time is before `finishTime`
        setShow(nowUTC <= finishTimeUTC);
      } else if (startTimeUTC && finishTimeUTC) {
        // If both are set, show if current time is between `startTime` and `finishTime`
        setShow(nowUTC >= startTimeUTC && nowUTC <= finishTimeUTC);
      }
    } else {
      // Always hide if `isEnable` is false
      setShow(false);
    }
  }, [isEnable, startTime, finishTime, contentId]);

  const handleClose = () => {
    setVisible(false);
    if (doNotShowAgain) {
      // Save the "do not show again" flag and contentID to localStorage
      localStorage.setItem("PLATEAUVIEW3_STORAGE_NOTIFICATION_DO_NOT_SHOW_AGAIN", "true");
      localStorage.setItem("PLATEAUVIEW3_STORAGE_NOTIFICATION_CONTENT_ID", contentId || "");
    }
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDoNotShowAgain(event.target.checked);
  };

  return {
    ready,
    visible,
    show,
    content,
    handleClose,
    handleCheckboxChange,
    doNotShowAgain,
    setVisible,
  };
};
