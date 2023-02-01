import { FieldComponent } from "@web/extensions/sidebar/core/newTypes";
import { ComponentType } from "react";

import Description from "./Description";
import IdealZoom from "./IdealZoom";
import Legend from "./Legend";
// import Template from "./Template";

// export type FieldGroup = "general" | "point" | "polyline" | "polygon" | "3d-model" | "3d-tile";

// export type FieldType = "template" | "idealZoom" | "description" | "legend";

// export type BaseField<T extends FieldType> = {
//   id: string;
//   type: T;
//   title: string;
//   // icon?: string;
//   // url?: string;
//   // onChange?: () => void;
// };

export type Fields<FC extends FieldComponent> = {
  [F in FC["type"]]: ComponentType<FieldComponent & any>;
};

const fieldComponents: Fields<FieldComponent> = {
  camera: IdealZoom,
  legend: Legend,
  description: Description,
  // template: Template,
  point: Description,
  realtime: Description,
};

export default fieldComponents;
