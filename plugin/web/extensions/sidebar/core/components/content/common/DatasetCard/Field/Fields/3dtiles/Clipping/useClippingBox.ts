import { postMsg } from "@web/extensions/sidebar/utils";
import { useEffect, useRef } from "react";

import { BaseFieldProps } from "../../types";

export const useClippingBox = ({
  options,
  dataID,
}: Pick<BaseFieldProps<"clipping">, "dataID"> & {
  options: Omit<BaseFieldProps<"clipping">["value"], "id" | "group" | "type">;
}) => {
  const renderer = useRef<ClippingBoxRenderer>();

  useEffect(() => {
    const render = async () => {
      if (options.enabled && !renderer.current) {
        renderer.current = await mountClippingBox({
          dataID,
          keepBoxAboveGround: options.aboveGroundOnly,
          show: options.show,
          direction: options.direction,
        });
      }
      if (renderer.current) {
        renderer.current.update({
          dataID,
          keepBoxAboveGround: options.aboveGroundOnly,
          show: options.show,
          direction: options.direction,
        });
      }
      if (!options.enabled && renderer.current) {
        renderer.current.unmount();
        renderer.current = undefined;
      }
    };
    render();
  }, [options.aboveGroundOnly, options.direction, options.enabled, options.show, dataID]);
};

const reearth = (globalThis.parent as any).reearth;

type LatLngHeight = {
  lng?: number;
  lat?: number;
  height?: number;
};

type BoxState = {
  activeBox?: boolean;
  activeScalePointIndex?: number; // 0 ~ 11
  isScalePointClicked?: boolean;
  activeEdgeIndex?: number; // 0 ~ 4
  isEdgeClicked: boolean;
  cursor?: string;
};

type ClippingBoxState = {
  dataID: string | undefined;
  keepBoxAboveGround: boolean;
  direction: "inside" | "outside";
  show: boolean;
};

type ClippingBoxRenderer = {
  update: (state: ClippingBoxState) => void;
  unmount: () => void;
};

const mountClippingBox = async (initialState: ClippingBoxState): Promise<ClippingBoxRenderer> => {
  const viewport = reearth.viewport;
  const centerOnScreen = reearth.scene.getLocationFromScreen(
    viewport.width / 2,
    viewport.height / 2,
  );
  const dimensions = {
    width: 100,
    height: 100,
    length: 100,
  };
  const location: LatLngHeight = {
    lng: centerOnScreen.lng,
    lat: centerOnScreen.lat,
    height: dimensions.height,
  };
  // const clipping = {};
  const box = {
    outlineColor: "#ffffff",
    activeOutlineColor: "#0ee1ff",
    outlineWidth: 1,
    draggableOutlineWidth: 10,
    draggableOutlineColor: "rgba(14, 225, 255, 0.5)",
    activeDraggableOutlineColor: "rgba(14, 225, 255, 1)",
    fillColor: "rgba(255, 255, 255, 0.1)",
    axisLineColor: "#ffffff",
    axisLineWidth: "#ffffff",
    pointFillColor: "rgba(255, 255, 255, 0.3)",
    pointOutlineColor: "rgba(14, 225, 255, 0.5)",
    activePointOutlineColor: "rgba(14, 225, 255, 1)",
    pointOutlineWidth: 1,
  };

  const state = {
    keepBoxAboveGround: !!initialState.keepBoxAboveGround,
    dataID: initialState.dataID,
    isVisible: !!initialState.show,
    direction: initialState.direction,
  };

  const boxProperties: any = {
    ...dimensions,
    ...box,
  };

  const boxState: BoxState = {
    activeBox: false,
    activeScalePointIndex: undefined, // 0 ~ 11
    isScalePointClicked: false,
    activeEdgeIndex: undefined, // 0 ~ 4
    isEdgeClicked: false,
    cursor: "default", // grab | grabbing | default
  };

  const updateBox = () => {
    postMsg({
      action: "updateClippingBox",
      payload: {
        dataID: state.dataID,
        box: {
          ...boxProperties,
          cursor: boxState.cursor,
          activeBox: boxState.activeBox,
          activeScalePointIndex: boxState.activeScalePointIndex,
          activeEdgeIndex: boxState.activeEdgeIndex,
          allowEnterGround: !state.keepBoxAboveGround,
        },
        clipping: {
          ...boxProperties,
          coordinates: [location.lng, location.lat, location.height],
          visible: state.isVisible,
          direction: state.direction,
          allowEnterGround: !state.keepBoxAboveGround,
        },
      },
    });
  };

  updateBox();

  const update = (next: ClippingBoxState) => {
    state.dataID = next.dataID;
    state.isVisible = next.show;
    state.keepBoxAboveGround = next.keepBoxAboveGround;
    state.direction = next.direction;
    updateBox();
  };
  const unmount = () => {
    postMsg({
      action: "removeClippingBox",
      payload: {
        dataID: state.dataID,
      },
    });
  };
  return { update, unmount };
};
