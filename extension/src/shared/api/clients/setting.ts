import { Setting } from "../types";

import { CityOptions, PlateauAPIClient } from "./base";

export let settingClient: PlateauAPIClient<Setting> | undefined;
export const createSettingClient = (
  projectId: string,
  url: string,
  token: string | undefined,
  cityOptions?: CityOptions,
) => {
  settingClient = new PlateauAPIClient(projectId, url, token, "data", cityOptions);
};
