export type ScreenSpaceSelectionEventType = "point" | "rectangle";
export type ScreenSpaceSelectionEventAction = "replace" | "add" | "remove";

interface ScreenSpaceSelectionEventBase {
  type: ScreenSpaceSelectionEventType;
  action: ScreenSpaceSelectionEventAction;
}

export interface PointScreenSpaceSelectionEvent extends ScreenSpaceSelectionEventBase {
  type: "point";
  layerId?: string;
  featureId?: string;
}

export interface RectangleScreenSpaceSelectionEvent extends ScreenSpaceSelectionEventBase {
  type: "rectangle";
  startPosition: [x: number, y: number];
  endPosition: [x: number, y: number];
}

export type ScreenSpaceSelectionEvent =
  | PointScreenSpaceSelectionEvent
  | RectangleScreenSpaceSelectionEvent;

export type ScreenSpaceSelectionEventHandler = (event: ScreenSpaceSelectionEvent) => void;
