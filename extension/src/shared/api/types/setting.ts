import { CameraPosition } from "../../reearth/types";

import { ComponentGroup } from "./component";
import { FeatureInspectorConfig } from "./featureInspector";

export type Setting = {
  id: string;
  datasetId: string;
  dataId: string;
  general?: {
    camera?: CameraPosition;
  };
  fieldComponents?: {
    templateId?: string;
    groups?: ComponentGroup[];
  };
  featureInspector?: {
    templateId?: string;
    config?: FeatureInspectorConfig;
  };
};
