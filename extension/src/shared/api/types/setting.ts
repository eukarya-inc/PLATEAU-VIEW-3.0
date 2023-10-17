import { CameraPosition } from "../../reearth/types";

import { ComponentGroup } from "./component";
import { EmphasisProperty } from "./emphasis";

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
  featureInspector?: FeatureInspectorSettings;
};

export type FeatureInspectorSettings = {
  basic: {
    titleType: "datasetType" | "custom";
    customTitle: string;
    displayType: "propertyList" | "";
  };
  emphasisProperty: {
    templateId: string;
    properties: EmphasisProperty[];
  };
};
