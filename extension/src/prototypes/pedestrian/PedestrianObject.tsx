import { useTheme } from "@mui/material";
import { AnimatePresence } from "framer-motion";
import { useEffect, useMemo, type FC, useState, useDeferredValue } from "react";

import { PedestrianMarkerAppearances, PedestrianMarkerLayer } from "../../shared/reearth/layers";

import balloonImage from "./assets/balloon.png";
import iconImage from "./assets/icon.png";
import { computeCartographicToCartesian } from "./computeCartographicToCartesian";
import { LevitationCircle } from "./LevitationCircle";
import { type Location } from "./types";
import { useMotionPosition } from "./useMotionPosition";

// interface SensorProps {
//   id: string;
//   position: Cartesian3;
//   offset: Cartesian3;
// }

// const Sensor: FC<SensorProps> = ({ id, position, offset }) => {
//   const { setNodeRef, transform, listeners } = useDraggable({
//     id,
//     data: offset,
//   });

//   const scene = useCesium(({ scene }) => scene);
//   useEffect(() => {
//     if (transform != null) {
//       convertScreenToPositionOffset(scene, position, transform, offset);
//     } else {
//       Cartesian3.ZERO.clone(offset);
//     }
//     scene.requestRender();
//   }, [position, offset, transform, scene]);

//   return (
//     <ScreenSpaceElement
//       ref={setNodeRef}
//       position={position}
//       style={{
//         width: 32,
//         height: 32,
//         top: -16 + (transform?.y ?? 0),
//         left: 16 + (transform?.x ?? 0),
//         cursor: "pointer",
//         pointerEvents: "auto",
//       }}
//       {...listeners}
//       onContextMenu={preventDefault}
//     />
//   );
// };

export interface PedestrianObjectProps {
  id: string;
  location: Location;
  selected?: boolean;
  levitated?: boolean;
}

export const PedestrianObject: FC<PedestrianObjectProps> = ({
  id,
  location,
  selected = false,
  levitated = true,
}) => {
  const theme = useTheme();

  const balloonAppearance: PedestrianMarkerAppearances = useMemo(
    () => ({
      marker: {
        image: balloonImage,
        imageSize: 0.5,
        pixelOffset: [16, -16],
        heightReference: "relative",
        near: 10,
        fat: 1e4,
        eyeOffset: [0, 0, -10],
        imageColor: selected ? theme.palette.primary.main : "#000000",
      },
    }),
    [selected, theme],
  );
  const defferedBalloonAppearance = useDeferredValue(balloonAppearance);
  const iconAppearance: PedestrianMarkerAppearances = useMemo(
    () => ({
      marker: {
        image: iconImage,
        imageSize: 0.5,
        pixelOffset: [16, -16],
        heightReference: "relative",
        near: 10,
        fat: 1e4,
        // WORKAROUND: Render front of balloon.
        eyeOffset: [0, 0, -10.1],
      },
    }),
    [],
  );

  const position = useMemo(() => computeCartographicToCartesian(location), [location]);
  const motionPosition = useMotionPosition(position);

  useEffect(() => {
    return motionPosition.animatePosition(position);
  }, [position, motionPosition]);

  // useEffect(() => {
  //   return motionPosition.on("renderRequest", () => {
  //     scene.requestRender();
  //   });
  // }, [scene, motionPosition]);

  // const offset = useMemo(() => new Cartesian3(), []);

  // usePreRender(() => {
  // const position = Cartesian3.fromElements(...motionPosition.get(), positionScratch);
  // Cartesian3.add(position, offset, position);
  // const cartographic = Cartographic.fromCartesian(
  //   position,
  //   scene.globe.ellipsoid,
  //   cartographicScratch,
  // );
  // cartographic.height = location.height ?? 0;
  // Cartographic.toCartesian(cartographic, scene.globe.ellipsoid, position);

  //   const balloon = balloonRef.current;
  //   if (balloon != null) {
  //     balloon.position = position;
  //   }
  //   const icon = iconRef.current;
  //   if (icon != null) {
  //     icon.position = position;
  //   }
  // });

  // TODO(ReEarth): Improve the animation model to update the position internally.
  const [offset, _setOffset] = useState<[lng: number, lat: number, height: number]>(() => [
    0, 0, 0,
  ]);

  const coordinates = useMemo(() => {
    const [_offsetX, _offsetY, _offsetZ] = window.reearth?.scene?.toXYZ(...offset, {
      useGlobeEllipsoid: true,
    }) ?? [0, 0, 0];

    const nextPosition = [position.x, position.y, position.z] as const;
    const [lng, lat] = window.reearth?.scene?.toLngLatHeight(...nextPosition, {
      useGlobeEllipsoid: true,
    }) ?? [0, 0, 0];
    return [lng, lat, location.height ?? 0] as [lng: number, lat: number, height: number];
  }, [location, position, offset]);

  // TODO(ReEarth): DnD
  useEffect(() => {
    window.reearth?.on?.("mousedown", () => {});
  }, []);

  return (
    <>
      {/* {selected && <Sensor id={id} position={position} offset={offset} />} */}
      <PedestrianMarkerLayer
        id={id}
        coordinates={coordinates}
        appearances={defferedBalloonAppearance}
      />
      <PedestrianMarkerLayer id={id} coordinates={coordinates} appearances={iconAppearance} />
      <AnimatePresence>
        {levitated && <LevitationCircle motionPosition={motionPosition} offset={offset} />}
      </AnimatePresence>
    </>
  );
};
