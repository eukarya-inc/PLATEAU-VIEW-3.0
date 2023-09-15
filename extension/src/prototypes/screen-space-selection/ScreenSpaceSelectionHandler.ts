/* eslint-disable @typescript-eslint/no-unused-vars */

import { Event } from "../../shared/helpers";

import {
  type ScreenSpaceSelectionEvent,
  type ScreenSpaceSelectionEventAction,
} from "./ScreenSpaceSelectionEvent";

const pointEvent = {
  type: "point",
  action: "replace" as ScreenSpaceSelectionEventAction,
  layerId: undefined as string | undefined,
  featureId: undefined as string | undefined,
} satisfies ScreenSpaceSelectionEvent;

// TODO(ReEarth): Support selecting multiple feature
// const rectangleEvent = {
//   type: "rectangle",
//   action: "replace" as ScreenSpaceSelectionEventAction,
//   startPosition: [0, 0],
//   endPosition: [0, 0],
// } satisfies ScreenSpaceSelectionEvent;

function actionForModifier(keyName?: string): ScreenSpaceSelectionEventAction {
  // TODO: How we can determine meta key is pressed?

  return keyName === "Shift" ? "add" : "replace";
}

export class ScreenSpaceSelectionHandler {
  readonly indeterminate = new Event<ScreenSpaceSelectionEvent>();
  readonly change = new Event<ScreenSpaceSelectionEvent>();

  // private readonly handler: ScreenSpaceEventHandler;
  // private startPosition?: [x: number, y: number];
  private currentKeyName?: string;

  #disabled = false;

  constructor() {
    // const handler = new ScreenSpaceEventHandler(scene.canvas);

    window.addEventListener("keydown", this.handleKeyDown);

    window.reearth?.on?.("select", this.handleSelect);

    // TODO(ReEarth): Support selecting multiple features
    // handler.setInputAction(this.handleClick, ScreenSpaceEventType.LEFT_CLICK);
    // handler.setInputAction(
    //   this.handleClickWithModifier.bind(this, KeyboardEventModifier.SHIFT),
    //   ScreenSpaceEventType.LEFT_CLICK,
    //   KeyboardEventModifier.SHIFT,
    // );
    // handler.setInputAction(this.handleMouseDown, ScreenSpaceEventType.LEFT_DOWN);
    // handler.setInputAction(this.handleMouseUp, ScreenSpaceEventType.LEFT_UP);
    // handler.setInputAction(
    //   this.handleMouseDown,
    //   ScreenSpaceEventType.LEFT_DOWN,
    //   KeyboardEventModifier.SHIFT,
    // );
    // handler.setInputAction(
    //   this.handleMouseUpWithModifier.bind(this, KeyboardEventModifier.SHIFT),
    //   ScreenSpaceEventType.LEFT_UP,
    //   KeyboardEventModifier.SHIFT,
    // );
    // this.handler = handler;
  }

  destroy(): void {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.reearth?.off?.("select", this.handleSelect);
  }

  get disabled(): boolean {
    return this.#disabled;
  }

  set disabled(value: boolean) {
    this.#disabled = value;
  }

  private handleSelect = (layerId?: string, featureId?: string) => {
    this.handleClickWithModifier(layerId, featureId, this.currentKeyName);
  };

  private handleKeyDown(e: KeyboardEvent) {
    this.currentKeyName = e.key;
  }

  private handleClickWithModifier(layerId?: string, featureId?: string, keyName?: string): void {
    this.handleClick(layerId, featureId, keyName);
  }

  private readonly handleClick = (layerId?: string, featureId?: string, keyName?: string): void => {
    if (this.disabled) {
      return;
    }
    pointEvent.action = actionForModifier(keyName);
    pointEvent.layerId = layerId;
    pointEvent.featureId = featureId;
    this.change.dispatch(pointEvent);
  };

  // private readonly handleMouseDown = (_event: MouseEvent): void => {
  //   if (this.disabled) {
  //     return;
  //   }
  // TODO(ReEarth): Support selecting multiple feature
  // this.startPosition = event.position;
  // this.handler.setInputAction(this.handleMouseMove, ScreenSpaceEventType.MOUSE_MOVE);
  // this.handler.setInputAction(
  //   this.handleMouseMove,
  //   ScreenSpaceEventType.MOUSE_MOVE,
  //   KeyboardEventModifier.SHIFT,
  // );
  // };

  // private handleMouseUpWithModifier(keyName: string, position: [x: number, y: number]): void {
  //   this.handleMouseUp(position, keyName);
  // }

  // private readonly handleMouseUp = (position: [x: number, y: number], keyName?: string): void => {
  //   if (this.disabled) {
  //     return;
  //   }
  //   this.handleMouseMove(position, keyName, false);
  //   this.startPosition = undefined;
  // TODO(ReEarth): Support selecting multiple feature
  // this.handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
  // this.handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE, KeyboardEventModifier.SHIFT);
  // };

  // private readonly handleMouseMove = (
  //   position: [x: number, y: number],
  //   _keyName?: string,
  //   _indeterminate = true,
  // ): void => {
  //   if (this.disabled) {
  //     return;
  //   }
  //   if (this.startPosition == null) {
  //     return;
  //   }
  //   let x1 = this.startPosition[0];
  //   let y1 = this.startPosition[1];
  //   let x2 = position[0];
  //   let y2 = position[1];
  //   if (x1 > x2) {
  //     [x2, x1] = [x1, x2];
  //   }
  //   if (y1 > y2) {
  //     [y2, y1] = [y1, y2];
  //   }
  // TODO(ReEarth): Support selecting multiple feature
  // rectangleEvent.action = actionForModifier(modifier);
  // this.startPosition.clone(rectangleEvent.startPosition);
  // event.endPosition.clone(rectangleEvent.endPosition);
  // rectangleEvent.rectangle.x = x1;
  // rectangleEvent.rectangle.y = y1;
  // rectangleEvent.rectangle.width = x2 - x1;
  // rectangleEvent.rectangle.height = y2 - y1;
  // if (indeterminate) {
  //   this.indeterminate.raiseEvent(rectangleEvent);
  // } else {
  //   this.change.raiseEvent(rectangleEvent);
  // }
  // };
}
