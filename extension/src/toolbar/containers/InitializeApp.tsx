import { useSetAtom } from "jotai";
import { FC, useEffect } from "react";

import { useSettingClient, useTemplateClient } from "../../shared/api/hooks";
import { mockSettings } from "../../shared/api/mock";
import { settingsAtom } from "../../shared/states/setting";
import { templatesAtom } from "../../shared/states/template";

export const InitializeApp: FC = () => {
  const settingClient = useSettingClient();
  const templateClient = useTemplateClient();

  const setSettings = useSetAtom(settingsAtom);
  useEffect(() => {
    const fetch = async () => {
      //   const settings = await settingClient.findAll();
      const settings = mockSettings;
      setSettings(settings);
    };
    fetch();
  }, [settingClient, setSettings]);

  const setTemplates = useSetAtom(templatesAtom);
  useEffect(() => {
    const fetch = async () => {
      const templates = await templateClient.findAll();
      setTemplates(Array.isArray(templates) ? templates : []);
    };
    fetch();
  }, [templateClient, setTemplates]);

  return null;
};
