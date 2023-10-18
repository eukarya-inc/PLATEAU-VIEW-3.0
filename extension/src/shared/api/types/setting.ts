import { CameraPosition } from "../../reearth/types";

import { ComponentGroup } from "./component";
import { EmphasisProperty } from "./emphasis";

export type Setting = {
  id: string;
  datasetId: string;
  dataId: string;
  general?: {
    camera?: CameraPosition | undefined;
    dataFetching?: {
      enabled?: boolean;
      timeInterval?: number;
    };
    featureClickEvent?: {
      eventType: "openFeatureInspector" | "jumpToUrl";
      urlType?: "manual" | "featureProperty";
      manualUrl?: string;
      featurePropertyName?: string;
    };
  };
  fieldComponents?: {
    templateId?: string;
    groups?: ComponentGroup[];
  };
  featureInspector?: FeatureInspectorSettings;
};

export type FeatureInspectorSettings = {
  basic?: {
    titleType: "datasetType" | "custom";
    customTitle: string;
    displayType: "propertyList" | "";
  };
  emphasisProperty?: {
    templateId: string;
    properties: EmphasisProperty[];
  };
};
