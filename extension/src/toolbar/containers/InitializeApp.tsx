import { useSetAtom } from "jotai";
import { FC, useEffect, useLayoutEffect } from "react";

import { useSettingClient, useTemplateClient } from "../../shared/api/hooks";
import { useTimeline } from "../../shared/reearth/hooks/useTimeline";
import { updateAllSettingAtom } from "../../shared/states/setting";
import { updateAllTemplateAtom } from "../../shared/states/template";
import { useInteractionMode } from "../hooks/useInteractionMode";

export const InitializeApp: FC = () => {
  const settingClient = useSettingClient();
  const templateClient = useTemplateClient();

  const updateAllSetting = useSetAtom(updateAllSettingAtom);
  useEffect(() => {
    const fetch = async () => {
      const settings = await settingClient.findAll();
      updateAllSetting(settings);
    };
    fetch();
  }, [settingClient, updateAllSetting]);

  const updateAllTemplate = useSetAtom(updateAllTemplateAtom);
  useEffect(() => {
    const fetch = async () => {
      const templates = await templateClient.findAll();
      updateAllTemplate(Array.isArray(templates) ? templates : []);
    };
    fetch();
  }, [templateClient, updateAllTemplate]);

  // Initialze clock to 10am JST of current date
  const { handleTimelineJump } = useTimeline();
  useLayoutEffect(() => {
    const timezone = 9; // JST
    const now = new Date();
    now.setUTCHours(10 - timezone, 0, 0, 0);
    handleTimelineJump({ start: now, stop: now, current: now });
  }, [handleTimelineJump]);

  useInteractionMode();

  return null;
};
