import { Template } from "../types/template";

import { CityOptions, PlateauAPIClient } from "./base";

export let templateClient: PlateauAPIClient<Template> | undefined;
export const createTemplateClient = (
  projectId: string,
  url: string,
  token: string,
  cityOptions?: CityOptions,
) => {
  templateClient = new PlateauAPIClient(projectId, url, token, "templates", cityOptions);
};
