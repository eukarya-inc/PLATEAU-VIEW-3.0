import { atom, SetStateAction, type PrimitiveAtom } from "jotai";

import { type TileFeatureIndex } from "../../shared/plateau";
import { PlateauProperties } from "../../shared/plateau/layers";
import { colorMapPlateau, type ColorMap } from "../color-maps";

import { type ViewLayerModel } from "./createViewLayerModel";
import { type LayerColorScheme } from "./types";

export interface PlateauTilesetLayerStateParams {
  hiddenFeatures?: readonly string[];
}

export interface PlateauTilesetLayerState {
  isPlateauTilesetLayer: true;
  featureIndexAtom: PrimitiveAtom<TileFeatureIndex | null>;
  hiddenFeaturesAtom: PrimitiveAtom<readonly string[] | null>;
  propertiesAtom: PrimitiveAtom<PlateauProperties | null>;
  colorPropertyAtom: PrimitiveAtom<string | null>;
  colorMapAtom: PrimitiveAtom<ColorMap>;
  colorRangeAtom: PrimitiveAtom<number[]>;
  colorSchemeAtom: ViewLayerModel["colorSchemeAtom"];
  opacityAtom: PrimitiveAtom<number>;
}

export function createPlateauTilesetLayerState(
  params: PlateauTilesetLayerStateParams,
): PlateauTilesetLayerState {
  const propertiesAtom = atom<PlateauProperties | null>(null);
  const colorPropertyAtom = atom<string | null>(null);
  const colorMapAtom = atom<ColorMap>(colorMapPlateau);
  const colorRangeAtom = atom([0, 100]);
  const valueRangeAtom = atom(
    get => {
      const properties = get(propertiesAtom);
      const colorProperty = get(colorPropertyAtom);
      const property =
        colorProperty != null
          ? properties?.value?.find(({ name }) => name === colorProperty)
          : undefined;
      return property?.type === "number" ? [property.minimum, property.maximum] : [];
    },
    (_get, _set, _value: SetStateAction<number[]>) => {
      // Not writable
    },
  );

  const colorSchemeAtom = atom<LayerColorScheme | null>(get => {
    const properties = get(propertiesAtom);
    const colorProperty = get(colorPropertyAtom);
    if (colorProperty == null) {
      return null;
    }
    const property = properties?.value?.find(({ name }) => name === colorProperty);
    return property?.type === "qualitative"
      ? property.colorSet
      : {
          type: "quantitative",
          name: colorProperty.replaceAll("_", " "),
          colorMapAtom,
          colorRangeAtom,
          valueRangeAtom,
        };
  });

  return {
    isPlateauTilesetLayer: true,
    featureIndexAtom: atom<TileFeatureIndex | null>(null),
    hiddenFeaturesAtom: atom<readonly string[] | null>(params.hiddenFeatures ?? null),
    propertiesAtom,
    colorPropertyAtom,
    colorMapAtom,
    colorRangeAtom,
    colorSchemeAtom,
    opacityAtom: atom(1),
  };
}
