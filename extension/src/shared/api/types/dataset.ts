import { DatasetItem } from "../../graphql/types/plateau";

export type Dataset = {
  id: string;

  municipalityCode: string;
  municipalityName: string;
  items: DatasetItem[];
  version: string;
  textured?: boolean;
  lod?: number;
  published?: boolean;
};
