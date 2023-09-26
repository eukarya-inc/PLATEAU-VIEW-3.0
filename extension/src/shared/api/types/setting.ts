import { CameraPosition } from "../../reearth/types";

import { ComponentGroup } from "./component";
import { Infobox } from "./infobox";

export type Setting = {
  id: string;
  datasetId: string;
  dataId: string;
  groups?: ComponentGroup[];
  template?: {
    groupId?: string;
    infoboxId?: string;
  };
  infobox?: Infobox;
  camera?: CameraPosition;
};
