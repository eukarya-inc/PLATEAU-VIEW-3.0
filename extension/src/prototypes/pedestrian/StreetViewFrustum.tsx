import { useTheme } from "@mui/material";
import { animate, useMotionValue, useMotionValueEvent, usePresence } from "framer-motion";
import { useEffect, type FC, useMemo, useCallback, useState } from "react";

import { PedestrianFrustumAppearances, PedestrianFrustumLayer } from "../../shared/reearth/layers";

import { computeCartographicToCartesian } from "./computeCartographicToCartesian";
import { type HeadingPitch, type Location } from "./types";
import { useMotionPosition } from "./useMotionPosition";

interface StreetViewFrustumProps {
  location: Location;
  headingPitch: HeadingPitch;
  zoom: number;
  aspectRatio?: number;
  length?: number;
}

export const StreetViewFrustum: FC<StreetViewFrustumProps> = ({
  location,
  headingPitch,
  zoom,
  aspectRatio = 3 / 2,
  length = 200,
}) => {
  const theme = useTheme();

  const [ready, setReady] = useState(false);
  const handleLoad = useCallback(() => {
    setReady(true);
  }, []);

  const motionVisibility = useMotionValue(0);
  const [present, safeToRemove] = usePresence();
  useEffect(() => {
    if (!ready) return;
    return animate(motionVisibility, present ? 1 : 0, {
      type: "tween",
      ease: "easeOut",
      duration: 0.2,
      onComplete: () => {
        if (!present) {
          safeToRemove();
        }
      },
    }).stop;
  }, [motionVisibility, present, safeToRemove, ready]);

  const [opacity, setOpacity] = useState(0);
  useMotionValueEvent(motionVisibility, "change", latest => {
    return setOpacity(latest);
  });

  const position = useMemo(() => computeCartographicToCartesian(location), [location]);
  const motionPosition = useMotionPosition(position);

  useEffect(() => {
    return motionPosition.animatePosition(position);
  }, [position, motionPosition]);

  const coordinates = useMemo(() => {
    return (window.reearth?.scene?.toLngLatHeight(...motionPosition.get(), {
      useGlobeEllipsoid: true,
    }) ?? [0, 0, 0]) as [lng: number, lat: number, height: number];
  }, [motionPosition]);
  const frustumAppearance: PedestrianFrustumAppearances = useMemo(
    () => ({
      frustum: {
        color: theme.palette.primary.main,
        opacity,
        zoom,
        length,
        aspectRatio,
      },
      transition: {
        rotate: [headingPitch.heading, headingPitch.pitch, 0],
      },
    }),
    [theme, zoom, length, aspectRatio, headingPitch, opacity],
  );

  return (
    <PedestrianFrustumLayer
      useTransition
      coordinates={coordinates}
      appearances={frustumAppearance}
      onLoad={handleLoad}
    />
  );
};
