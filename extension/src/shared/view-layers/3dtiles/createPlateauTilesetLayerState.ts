import { atom, SetStateAction, type PrimitiveAtom } from "jotai";

import { colorMapPlateau, type ColorMap } from "../../../prototypes/color-maps";
import { type ViewLayerModel, type LayerColorScheme } from "../../../prototypes/view-layers";
import { type TileFeatureIndex } from "../../plateau";
import { PlateauTilesetProperties } from "../../plateau/layers";
import { ComponentIdParams, makeComponentAtomWrapper } from "../component";

export interface PlateauTilesetLayerStateParams extends Omit<ComponentIdParams, "componentType"> {
  hiddenFeatures?: readonly string[];
}

export interface PlateauTilesetLayerState {
  isPlateauTilesetLayer: true;
  featureIndexAtom: PrimitiveAtom<TileFeatureIndex | null>;
  hiddenFeaturesAtom: PrimitiveAtom<readonly string[] | null>;
  propertiesAtom: PrimitiveAtom<PlateauTilesetProperties | null>;
  colorPropertyAtom: PrimitiveAtom<string | null>;
  colorMapAtom: PrimitiveAtom<ColorMap>;
  colorRangeAtom: PrimitiveAtom<number[]>;
  colorSchemeAtom: ViewLayerModel["colorSchemeAtom"];
}

export function createPlateauTilesetLayerState(
  params: PlateauTilesetLayerStateParams,
): PlateauTilesetLayerState {
  const propertiesAtom = atom<PlateauTilesetProperties | null>(null);

  const colorPropertyAtom = makeComponentAtomWrapper(
    atom<string | null>(null),
    { ...params, componentType: "colorProperty" },
    true,
  );
  const colorMapAtom = makeComponentAtomWrapper(
    atom<ColorMap>(colorMapPlateau),
    { ...params, componentType: "colorMap" },
    true,
  );
  const colorRangeAtom = makeComponentAtomWrapper(
    atom([0, 100]),
    { ...params, componentType: "colorRange" },
    true,
  );
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
  };
}
