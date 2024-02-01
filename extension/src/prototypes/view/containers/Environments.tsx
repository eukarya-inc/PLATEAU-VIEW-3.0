import { atom, useAtomValue } from "jotai";
import { type FC, useMemo } from "react";

import { ShadowProps } from "../../../shared/reearth/scene";
import { AmbientOcclusion } from "../../../shared/reearth/types";
import type { AnnotationType } from "../../../shared/reearth/types/getAnnotationType";
import { TileLabels } from "../../../shared/reearth/types/scene.ts";
import {
  shareableEnvironmentTypeAtom,
  shareableGraphicsQualityAtom,
} from "../../../shared/states/scene";
import { colorModeAtom, type ColorMode } from "../../shared-states";
import { ElevationEnvironment } from "../environments/ElevationEnvironment";
import { GooglePhotorealisticEnvironment } from "../environments/GooglePhotorealisticEnvironment";
import { MapEnvironment } from "../environments/MapEnvironment";
import { SatelliteEnvironment } from "../environments/SatelliteEnvironment";
import { debugSphericalHarmonicsAtom, showMapLabelAtom } from "../states/app";
import {
  ambientOcclusionEnabledAtom,
  ambientOcclusionIntensityAtom,
  ambientOcclusionOutputTypeAtom,
  shadowMapEnabledAtom,
  shadowMapSizeAtom,
  shadowMapSoftShadowsAtom,
} from "../states/graphics";
import { AmbientOcclusionOutputType } from "../types/hbao";

export type EnvironmentType = "map" | "satellite" | "elevation" | "google-photorealistic";

const shadowMapPropsAtom = atom(
  (get): ShadowProps => ({
    enabled: get(shadowMapEnabledAtom),
    size: get(shadowMapSizeAtom),
    softShadows: get(shadowMapSoftShadowsAtom),
  }),
);

const ambientOcclusionPropsAtom = atom((get): AmbientOcclusion => {
  const quality = get(shareableGraphicsQualityAtom) || undefined;
  return {
    enabled: get(ambientOcclusionEnabledAtom),
    intensity: get(ambientOcclusionIntensityAtom),
    quality: quality === "ultra" ? "extreme" : quality,
    // TODO(ReEarth): Support other output type
    ambientOcclusionOnly:
      get(ambientOcclusionOutputTypeAtom) === AmbientOcclusionOutputType.Occlusion,
  };
});

export const Environments: FC = () => {
  const environmentType = useAtomValue(shareableEnvironmentTypeAtom);
  const colorMode = useAtomValue(colorModeAtom);
  const showMapLabel = useAtomValue(showMapLabelAtom);
  const debugSphericalHarmonics = useAtomValue(debugSphericalHarmonicsAtom);
  const shadowProps = useAtomValue(shadowMapPropsAtom);
  const ambientOcclusionProps = useAtomValue(ambientOcclusionPropsAtom);
  const graphicsQuality = useAtomValue(shareableGraphicsQualityAtom) || undefined;
  const antialias = graphicsQuality === "ultra" ? "extreme" : graphicsQuality;

  const styleOverrides: Record<ColorMode, any> = useMemo(
    () => ({
      light: {
        default: {
          fillColor: "#000000",
          outlineColor: "rgba(255, 255, 255, 0.8)",
        },
        towns: {
          fillColor: "rgba(0, 0, 0, 0.6)",
        },
        topography: {
          fillColor: "rgba(0, 0, 0, 0.6)",
        },
      },
      dark: {
        default: {
          fillColor: "#FFFFFF",
          outlineColor: "rgba(0, 0, 0, 0.8)",
        },
        towns: {
          fillColor: "rgba(255, 255, 255, 0.6)",
        },
        topography: {
          fillColor: "rgba(255, 255, 255, 0.6)",
        },
      },
    }),
    [],
  );

  const tileLabels: TileLabels[] = useMemo(() => {
    return Object.entries(showMapLabel)
      .map(([key, isVisible]) => {
        if (isVisible) {
          return {
            id: `label_${key}`,
            labelType: "japan_gsi_optimal_bvmap",
            style:
              styleOverrides[colorMode][key as AnnotationType] || styleOverrides[colorMode].default,
          };
        }
        return null;
      })
      .filter(Boolean) as TileLabels[];
  }, [showMapLabel, colorMode, styleOverrides]);

  switch (environmentType) {
    case "map":
      return (
        <MapEnvironment
          debugSphericalHarmonics={debugSphericalHarmonics}
          colorMode={colorMode}
          ambientOcclusion={ambientOcclusionProps}
          shadows={shadowProps}
          antialias={antialias}
          tileLabels={tileLabels}
        />
      );
    case "satellite":
      return (
        <SatelliteEnvironment
          debugSphericalHarmonics={debugSphericalHarmonics}
          ambientOcclusion={ambientOcclusionProps}
          shadows={shadowProps}
          antialias={antialias}
          tileLabels={tileLabels}
        />
      );
    case "elevation":
      return (
        <ElevationEnvironment
          debugSphericalHarmonics={debugSphericalHarmonics}
          ambientOcclusion={ambientOcclusionProps}
          shadows={shadowProps}
          antialias={antialias}
          tileLabels={tileLabels}
        />
      );
    case "google-photorealistic":
      return (
        <GooglePhotorealisticEnvironment
          ambientOcclusion={ambientOcclusionProps}
          shadows={shadowProps}
          antialias={antialias}
          tileLabels={tileLabels}
        />
      );
  }
};
