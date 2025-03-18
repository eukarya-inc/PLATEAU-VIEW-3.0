import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo, useState } from "react";

import { useIsCityProject } from "../../states/environmentVariables";
import { settingForCityIdsAtom, settingsAtom, updateSettingAtom } from "../../states/setting";
import { Setting } from "../types";

import { useSettingClient } from "./useSettingClient";

export default () => {
  const client = useSettingClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isCityProject] = useIsCityProject();
  const [settingForCityIds, setSettingForCityIds] = useAtom(settingForCityIdsAtom);

  const updateSetting = useSetAtom(updateSettingAtom);
  const saveSetting = useCallback(
    async (setting: Setting) => {
      setIsSaving(true);

      const settings = isCityProject ? await client.findAllForCity() : await client.findAll();
      const existSetting = settings?.find(
        s => s.datasetId === setting.datasetId && s.dataId === setting.dataId,
      );

      const nextSetting = await (async () => {
        if (existSetting) {
          return await client.update(existSetting.id, setting);
        }
        if (setting.id) {
          return await client.update(setting.id, setting);
        }
        return await client.save(setting);
      })();

      if (isCityProject) {
        setSettingForCityIds(((await client.findAllForCity()) ?? []).map(s => s.id));
      }
      updateSetting(nextSetting);

      setIsSaving(false);
    },
    [client, updateSetting, isCityProject, setSettingForCityIds],
  );

  const settingsAll = useAtomValue(settingsAtom);
  const settings = useMemo(
    () => (isCityProject ? settingsAll.filter(s => settingForCityIds.includes(s.id)) : settingsAll),
    [isCityProject, settingForCityIds, settingsAll],
  );

  return {
    isSaving,
    saveSetting,
    settings,
  };
};
