import { atom, useAtom } from "jotai";
import { useCallback } from "react";

// import { DATA_API } from "../../constants";
import { mockSettings } from "../mock";
import { Setting } from "../types";

const settingsAtom = atom<Setting[]>([]);

export default () => {
  const [_, setSettings] = useAtom(settingsAtom);
  const handleSettingsFetch = useCallback(async () => {
    // TODO: use the new settings API
    // const response = await fetch(`${DATA_API}/sidebar/plateauview3/data`);
    // const settings = await response.json();

    setSettings(mockSettings);
  }, [setSettings]);

  return {
    settingsAtom,
    handleSettingsFetch,
  };
};
