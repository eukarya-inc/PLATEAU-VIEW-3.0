import { ComponentType } from "react";

import Description from "./Description";
import IdealZoom from "./IdealZoom";
import Legend from "./Legend";
import { FieldComponent } from "./types";
// import Template from "./Template";

export type Fields<FC extends FieldComponent> = {
  [F in FC["type"]]: ComponentType<FieldComponent & any>;
};

const fieldComponents: Fields<FieldComponent> = {
  camera: IdealZoom,
  legend: Legend,
  description: Description,
  // point: Point,
  // realtime: Realtime,
  // template: Template,
};

export default fieldComponents;
