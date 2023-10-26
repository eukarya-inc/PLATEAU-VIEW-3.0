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
      eventType: "openFeatureInspector" | "openNewTab";
      urlType?: "manual" | "fromData";
      websiteURL?: string;
      fieldName?: string;
    };
  };
  fieldComponents?: {
    useTemplate?: boolean;
    templateId?: string;
    groups?: ComponentGroup[];
  };
  featureInspector?: FeatureInspectorSettings;
};

export type FeatureInspectorSettings = {
  basic?: {
    titleType: "datasetType" | "custom";
    customTitle: string;
    displayType: "auto" | "builtin" | "propertyList" | "CZMLDescription";
  };
  emphasisProperty?: {
    useTemplate?: boolean;
    templateId?: string;
    properties?: EmphasisProperty[];
  };
};
