// import { DndContext, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { DndContext, DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { AnimatePresence } from "framer-motion";
import { atom, useAtomValue } from "jotai";
import { nanoid } from "nanoid";
import { useMemo, type FC, useState, useCallback } from "react";

import { PEDESTRIAN_MARKER_ID_PROPERTY } from "../../shared/reearth/layers";
import { XYZ } from "../../shared/reearth/types";
import { composeIdentifier, matchIdentifier } from "../cesium-helpers";
import { layerSelectionAtom } from "../layers";
import { useConstant } from "../react-helpers";
import {
  screenSpaceSelectionAtom,
  useScreenSpaceSelectionResponder,
  type ScreenSpaceSelectionEntry,
} from "../screen-space-selection";

import { computeCartographicToCartesian } from "./computeCartographicToCartesian";
import { PedestrianObject } from "./PedestrianObject";
import { StreetViewFrustum } from "./StreetViewFrustum";
import { type HeadingPitch, type Location } from "./types";

export const PEDESTRIAN_OBJECT = "PEDESTRIAN_OBJECT";

declare module "../screen-space-selection" {
  interface ScreenSpaceSelectionOverrides {
    [PEDESTRIAN_OBJECT]: string;
  }
}

export interface PedestrianProps {
  id?: string;
  location: Location;
  headingPitch?: HeadingPitch;
  zoom?: number;
  hideFrustum?: boolean;
  onChange?: (location: Location) => void;
}

export const Pedestrian: FC<PedestrianProps> = ({
  id,
  location,
  headingPitch,
  zoom,
  hideFrustum = false,
  onChange,
}) => {
  const defaultId = useConstant(() => nanoid());
  const objectId = composeIdentifier({
    type: "Pedestrian",
    key: id ?? defaultId,
  });

  useScreenSpaceSelectionResponder({
    type: PEDESTRIAN_OBJECT,
    convertToSelection: object => {
      return "properties" in object &&
        object.properties &&
        typeof object.properties === "object" &&
        PEDESTRIAN_MARKER_ID_PROPERTY in object.properties &&
        object.properties.pedestrianID === objectId
        ? {
            type: PEDESTRIAN_OBJECT,
            value: objectId,
          }
        : undefined;
    },
    shouldRespondToSelection: (
      value,
    ): value is ScreenSpaceSelectionEntry<typeof PEDESTRIAN_OBJECT> => {
      return value.type === PEDESTRIAN_OBJECT && value.value === objectId;
    },
    computeBoundingSphere: () => {
      const result = computeCartographicToCartesian(location);
      result.radius = 200; // Arbitrary size
      return result;
    },
  });

  const selected = useAtomValue(
    useMemo(
      () =>
        atom(get => {
          const screenSpaceSelection = get(screenSpaceSelectionAtom);
          const layerSelection = get(layerSelectionAtom);
          return (
            screenSpaceSelection.some(
              ({ type, value }) =>
                type === PEDESTRIAN_OBJECT &&
                matchIdentifier(value, { type: "Pedestrian", key: id }),
            ) || layerSelection.some(selection => selection.id === id)
          );
        }),
      [id],
    ),
  );

  const [dragKey, setDragKey] = useState(0);
  const [levitated, setLevitated] = useState(false);
  const handleDragStart = useCallback((_event: DragStartEvent) => {
    setLevitated(true);
  }, []);
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const referenceLocation = location;
      const offset = event.active.data.current as XYZ;
      const position = window.reearth?.scene?.toXYZ(
        referenceLocation.longitude,
        referenceLocation.latitude,
        referenceLocation.height ?? 0,
        { useGlobeEllipsoid: true },
      ) ?? [0, 0, 0];
      const nextPosition = [
        position[0] + offset.x,
        position[1] + offset.y,
        position[2] + offset.z,
      ] as const;
      const [lng, lat, height] = window.reearth?.scene?.toLngLatHeight(...nextPosition, {
        useGlobeEllipsoid: true,
      }) ?? [0, 0, 0];
      setDragKey(Math.random());
      setLevitated(false);
      onChange?.({
        longitude: lng,
        latitude: lat,
        height: height,
      });
    },
    [location, onChange],
  );

  return (
    <DndContext autoScroll={false} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <PedestrianObject
        key={dragKey}
        id={objectId}
        location={location}
        selected={selected}
        levitated={levitated}
      />
      <AnimatePresence>
        {selected && !levitated && !hideFrustum && headingPitch != null && zoom != null && (
          <StreetViewFrustum location={location} headingPitch={headingPitch} zoom={zoom} />
        )}
      </AnimatePresence>
    </DndContext>
  );
};
