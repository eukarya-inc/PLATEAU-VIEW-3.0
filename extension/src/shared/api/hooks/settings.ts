import { useSetAtom } from "jotai";
import { useCallback, useState } from "react";

import { settingsAtom, updateSettingAtom } from "../../states/setting";
import { Setting } from "../types";

import { useSettingClient } from "./useSettingClient";

// TODO: Imple saving setting state to API
export default () => {
  const client = useSettingClient();
  const [isSaving, setIsSaving] = useState(false);

  const updateSetting = useSetAtom(updateSettingAtom);
  const saveSetting = useCallback(
    async (setting: Setting) => {
      setIsSaving(true);
      const nextSetting = await (async () => {
        if (setting.id) {
          return await client.update(setting.id, setting);
        } else {
          return await client.save(setting);
        }
      })();

      updateSetting(nextSetting);

      setIsSaving(false);
    },
    [client, updateSetting],
  );

  return {
    isSaving,
    saveSetting,
    settingsAtom,
  };
};
