import { ComponentType } from "react";

import BuildingColor from "./3dtiles/BuildingColor";
import BuildingFilter from "./3dtiles/BuildingFilter";
import BuildingShadow from "./3dtiles/BuildingShadow";
import BuildingTransparency from "./3dtiles/BuildingTransparency";
import Clipping from "./3dtiles/Clipping";
import ButtonLink from "./general/ButtonLink";
import Description from "./general/Description";
import IdealZoom from "./general/IdealZoom";
import Legend from "./general/Legend";
import Realtime from "./general/Realtime";
import StyleCode from "./general/StyleCode";
import SwitchGroup from "./general/SwitchGroup";
import PointColor from "./point/PointColor";
import PointColorGradient from "./point/PointColorGradient";
import PointIcon from "./point/PointIcon";
import PointLabel from "./point/PointLabel";
import PointModel from "./point/PointModel";
import PointSize from "./point/PointSize";
import PointStroke from "./point/PointStroke";
import PolygonColor from "./polygon/PolygonColor";
import PolygonColorGradient from "./polygon/PolygonColorGradient";
import PolygonStroke from "./polygon/PolygonStroke";
import PolylineColor from "./polyline/PolylineColor";
import PolylineColorGradient from "./polyline/PolylineColorGradient";
import PolylineStrokeWeight from "./polyline/PolylineStrokeWeight";
import { FieldComponent } from "./types";

// import Template from "./Template";

export type Fields<FC extends FieldComponent> = {
  [F in FC["type"]]: { Component: ComponentType<FieldComponent & any>; hasUI: boolean };
};

const fields: Fields<FieldComponent> = {
  // general
  idealZoom: { Component: IdealZoom, hasUI: false },
  legend: { Component: Legend, hasUI: true },
  description: { Component: Description, hasUI: true },
  switchGroup: { Component: SwitchGroup, hasUI: true },
  buttonLink: { Component: ButtonLink, hasUI: true },
  styleCode: { Component: StyleCode, hasUI: false },
  realtime: { Component: Realtime, hasUI: true },

  // point
  pointColor: { Component: PointColor, hasUI: false },
  pointColorGradient: { Component: PointColorGradient, hasUI: false },
  pointSize: { Component: PointSize, hasUI: false },
  pointIcon: { Component: PointIcon, hasUI: false },
  pointLabel: { Component: PointLabel, hasUI: false },
  pointModel: { Component: PointModel, hasUI: false },
  pointStroke: { Component: PointStroke, hasUI: false },
  // polyline
  polylineColor: { Component: PolylineColor, hasUI: false },
  polylineColorGradient: { Component: PolylineColorGradient, hasUI: false },
  polylineStrokeWeight: { Component: PolylineStrokeWeight, hasUI: false },
  // polygon
  polygonColor: { Component: PolygonColor, hasUI: false },
  polygonColorGradient: { Component: PolygonColorGradient, hasUI: false },
  polygonStroke: { Component: PolygonStroke, hasUI: false },
  // 3d-model
  clipping: { Component: Clipping, hasUI: true },
  buildingFilter: { Component: BuildingFilter, hasUI: true },
  buildingTransparency: { Component: BuildingTransparency, hasUI: true },
  buildingColor: { Component: BuildingColor, hasUI: true },
  buildingShadow: { Component: BuildingShadow, hasUI: true },
  // 3d-tile
  // realtime: Realtime,
  // template: Template,
};

export default fields;
