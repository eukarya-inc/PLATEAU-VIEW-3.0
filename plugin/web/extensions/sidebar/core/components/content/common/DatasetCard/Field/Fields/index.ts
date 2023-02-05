import { ComponentType } from "react";

// general
import Description from "./general/Description";
import IdealZoom from "./general/IdealZoom";
import Legend from "./general/Legend";
// point
import PointColor from "./point/PointColor";
import PointColorGradient from "./point/PointColorGradient";
import PointIcon from "./point/PointIcon";
import PointLabel from "./point/PointLabel";
import PointModel from "./point/PointModel";
import PointSize from "./point/PointSize";
import PointStroke from "./point/PointStroke";
import { FieldComponent } from "./types";
// import Template from "./Template";

export type Fields<FC extends FieldComponent> = {
  [F in FC["type"]]: ComponentType<FieldComponent & any>;
};

const fieldComponents: Fields<FieldComponent> = {
  // general
  camera: IdealZoom,
  legend: Legend,
  description: Description,
  // point
  pointColor: PointColor,
  pointColorGradient: PointColorGradient,
  pointSize: PointSize,
  pointIcon: PointIcon,
  pointLabel: PointLabel,
  pointModel: PointModel,
  pointStroke: PointStroke,
  // polyline
  // polygon
  // 3d-model
  // 3d-tile
  // realtime: Realtime,
  // template: Template,
};

export default fieldComponents;
