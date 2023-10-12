import { ViewLayerModel, ViewLayerModelParams } from "../../prototypes/view-layers";
import { DataType } from "../reearth/types/layer";

import { ComponentAtom } from "./component";

export type LayerModelParams = ViewLayerModelParams & {
  format?: string;
  url?: string;
};

export type LayerModelBase = {
  format?: DataType;
  url?: string;
  componentAtoms?: ComponentAtom[];
};

export type LayerModel = ViewLayerModel & LayerModelBase;
