import { ViewLayerModel, ViewLayerModelParams } from "../../prototypes/view-layers";

import { ComponentAtom } from "./component";

export type LayerModelParams = ViewLayerModelParams & {
  format?: string;
  url?: string;
};

export type LayerModelBase = {
  format?: string;
  url?: string;
  componentAtoms?: ComponentAtom[];
};

export type LayerModel = ViewLayerModel & LayerModelBase;
