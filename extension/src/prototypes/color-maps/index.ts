import { default as colorMapCividis } from "./colorMaps/cividis";
import { default as colorMapCrest } from "./colorMaps/crest";
import { default as colorMapFlare } from "./colorMaps/flare";
import { default as colorMapIcefire } from "./colorMaps/icefire";
import { default as colorMapInferno } from "./colorMaps/inferno";
import { default as colorMapMagma } from "./colorMaps/magma";
import { default as colorMapMako } from "./colorMaps/mako";
import { default as colorMapPlasma } from "./colorMaps/plasma";
import { default as colorMapPlateau } from "./colorMaps/plateau";
import { default as colorMapRocket } from "./colorMaps/rocket";
import { default as colorMapTurbo } from "./colorMaps/turbo";
import { default as colorMapViridis } from "./colorMaps/viridis";
import { default as colorMapVlag } from "./colorMaps/vlag";

export * from "./ColorMap";
export * from "./types";

export { default as colorMapCividis } from "./colorMaps/cividis";
export { default as colorMapCrest } from "./colorMaps/crest";
export { default as colorMapFlare } from "./colorMaps/flare";
export { default as colorMapIcefire } from "./colorMaps/icefire";
export { default as colorMapInferno } from "./colorMaps/inferno";
export { default as colorMapMagma } from "./colorMaps/magma";
export { default as colorMapMako } from "./colorMaps/mako";
export { default as colorMapPlasma } from "./colorMaps/plasma";
export { default as colorMapPlateau } from "./colorMaps/plateau";
export { default as colorMapRocket } from "./colorMaps/rocket";
export { default as colorMapTurbo } from "./colorMaps/turbo";
export { default as colorMapViridis } from "./colorMaps/viridis";
export { default as colorMapVlag } from "./colorMaps/vlag";

export const createColorMapFromType = (colorMapType: string) => {
  switch (colorMapType) {
    case colorMapCividis.type:
      return colorMapCividis;
    case colorMapCrest.type:
      return colorMapCrest;
    case colorMapFlare.type:
      return colorMapFlare;
    case colorMapIcefire.type:
      return colorMapIcefire;
    case colorMapInferno.type:
      return colorMapInferno;
    case colorMapMagma.type:
      return colorMapMagma;
    case colorMapMako.type:
      return colorMapMako;
    case colorMapPlasma.type:
      return colorMapPlasma;
    case colorMapPlateau.type:
      return colorMapPlateau;
    case colorMapRocket.type:
      return colorMapRocket;
    case colorMapTurbo.type:
      return colorMapTurbo;
    case colorMapViridis.type:
      return colorMapViridis;
    case colorMapVlag.type:
      return colorMapVlag;
  }
};
