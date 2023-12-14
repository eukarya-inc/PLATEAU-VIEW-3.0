// import { useTheme } from "@mui/material";
// import { animate, useMotionValue, usePresence } from "framer-motion";
import { type FC } from "react";

// import { useConstant } from "../react-helpers";

import { type MotionPosition } from "./useMotionPosition";

export interface LevitationCircleProps {
  motionPosition: MotionPosition;
  offset?: [lng: number, lat: number, height: number];
  radius?: number;
}

export const LevitationCircle: FC<LevitationCircleProps> = () =>
  // {
  // motionPosition,
  // offset = [0, 0, 0],
  // radius = 100,
  // },
  {
    // const scene = useCesium(({ scene }) => scene);

    // const motionLevitation = useMotionValue(0);
    // const [present, safeToRemove] = usePresence();
    // useEffect(() => {
    //   return animate(motionLevitation, present ? 1 : 0, {
    //     type: "tween",
    //     duration: 0.2,
    //     onComplete: () => {
    //       if (!present) {
    //         safeToRemove();
    //       }
    //     },
    //   }).stop;
    // }, [motionLevitation, present, safeToRemove]);

    // useEffect(() => {
    //   return motionLevitation.on("renderRequest", () => {
    //     scene.requestRender();
    //   });
    // }, [scene, motionLevitation]);

    // const positionPropertyCallback = (): Cartesian3 | undefined => {
    //   const position = Cartesian3.fromElements(...motionPosition.get(), positionScratch);
    //   const result = Cartesian3.add(position, offset, position);
    //   if (result.equals(Cartesian3.ZERO)) {
    //     // Entity requires non-zero magnitude position.
    //     return undefined;
    //   }
    //   return result;
    // };
    // const positionPropertyCallbackRef = useRef(positionPropertyCallback);
    // positionPropertyCallbackRef.current = positionPropertyCallback;

    // const positionProperty = useConstant(
    //   () =>
    //     new CallbackProperty(
    //       () => positionPropertyCallbackRef.current(),
    //       false,
    //     ) as unknown as PositionProperty,
    // );

    // const semiAxisProperty = useMemo(
    //   () => new CallbackProperty(() => Math.max(0.1, motionLevitation.get() * radius), false),
    //   [radius, motionLevitation],
    // );

    // const theme = useTheme();
    // const entityOptions = useMemo(
    //   (): EntityProps => ({
    //     position: positionProperty,
    //     ellipse: {
    //       semiMajorAxis: semiAxisProperty,
    //       semiMinorAxis: semiAxisProperty,
    //       fill: true,
    //       material: new ColorMaterialProperty(
    //         Color.fromCssColorString(theme.palette.primary.main).withAlpha(0.2),
    //       ),
    //       classificationType: ClassificationType.BOTH,
    //     },
    //   }),
    //   [theme, positionProperty, semiAxisProperty],
    // );

    // return <Entity {...entityOptions} />;
    return null;
  };
