import { Data } from "./data";

export type Dataset = {
  id: string;
  municipalityCode: string;
  municipalityName: string;
  data: Data[];
  version: string;
  textured?: boolean;
  lod?: number;
};
