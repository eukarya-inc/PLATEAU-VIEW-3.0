import { atom, useAtomValue, useSetAtom, type PrimitiveAtom } from "jotai";
import { memo, useCallback, useEffect, useMemo, useRef, useState, type FC } from "react";
import invariant from "tiny-invariant";

import {
  HeatmapAppearances,
  HeatmapLayer as ReEarthHeatmapLayer,
} from "../../shared/reearth/layers";
import { colorMapFlare, type ColorMap } from "../color-maps";
import {
  createMeshImageData,
  type MeshImageData,
  type ParseCSVOptions,
  type ParseCSVResult,
  parseCSVAsync,
  createMeshDataAsync,
} from "../heatmap";
import { type LayerProps } from "../layers";
import { inferMeshType } from "../regional-mesh";

import {
  createViewLayerModel,
  type ViewLayerModel,
  type ViewLayerModelParams,
} from "./createViewLayerModel";
import { HEATMAP_LAYER } from "./layerTypes";
import { type ConfigurableLayerModel, type LayerColorScheme } from "./types";

export interface HeatmapLayerModelParams extends ViewLayerModelParams {
  title?: string;
  getUrl: (code: string) => string | undefined;
  codes: readonly string[];
  parserOptions: ParseCSVOptions;
  opacity?: number;
}

export interface HeatmapLayerModel extends ViewLayerModel {
  getUrl: (code: string) => string | undefined;
  codes: readonly string[];
  parserOptions: ParseCSVOptions;
  opacityAtom: PrimitiveAtom<number>;
  valueRangeAtom: PrimitiveAtom<number[]>;
  contourSpacingAtom: PrimitiveAtom<number>;
}

export function createHeatmapLayer(
  params: HeatmapLayerModelParams,
): ConfigurableLayerModel<HeatmapLayerModel> {
  const colorMapAtom = atom<ColorMap>(colorMapFlare);
  const colorRangeAtom = atom([0, 100]);
  const valueRangeAtom = atom([0, 100]);
  const colorSchemeAtom = atom<LayerColorScheme | null>({
    type: "quantitative",
    name: params.title ?? "統計データ",
    colorMapAtom,
    colorRangeAtom,
    valueRangeAtom,
  });

  return {
    ...createViewLayerModel({
      ...params,
      title: params.title ?? "統計データ",
    }),
    type: HEATMAP_LAYER,
    getUrl: params.getUrl,
    codes: params.codes,
    parserOptions: params.parserOptions,
    opacityAtom: atom(params.opacity ?? 0.8),
    valueRangeAtom,
    contourSpacingAtom: atom(10),
    colorSchemeAtom,
  };
}

const Subdivision: FC<
  Omit<HeatmapLayerModel, "getUrl" | "codes"> & {
    url: string;
    // boundingSphere: BoundingSphere;
    onLoad?: (data: ParseCSVResult, url: string) => void;
  }
> = memo(
  ({
    hiddenAtom,
    colorSchemeAtom,
    url,
    // boundingSphere,
    parserOptions,
    opacityAtom,
    contourSpacingAtom,
    onLoad,
  }) => {
    const [data, setData] = useState<ParseCSVResult>();
    const onLoadRef = useRef(onLoad);
    onLoadRef.current = onLoad;
    useEffect(() => {
      let canceled = false;
      (async () => {
        const response = await window
          .fetch(`${import.meta.env.PLATEAU_ORIGIN}${url}`)
          .then(r => r.text());
        if (!response) {
          return;
        }
        const data = await parseCSVAsync(response, parserOptions);
        if (canceled) {
          return;
        }
        setData(data);
        onLoadRef.current?.(data, url);
      })().catch(error => {
        console.error(error);
      });
      return () => {
        canceled = true;
      };
    }, [url, parserOptions]);

    const [meshImageData, setMeshImageData] = useState<MeshImageData>();
    useEffect(() => {
      if (data == null) {
        setMeshImageData(undefined);
        return;
      }
      let canceled = false;
      (async () => {
        const meshData = await createMeshDataAsync(data);
        if (canceled) {
          return;
        }
        const meshImageData = createMeshImageData(meshData);
        setMeshImageData(meshImageData);
      })().catch(error => {
        console.error(error);
      });
      return () => {
        canceled = true;
      };
    }, [data]);

    const colorScheme = useAtomValue(colorSchemeAtom);
    invariant(colorScheme?.type === "quantitative");
    const colorMap = useAtomValue(colorScheme.colorMapAtom);
    const colorRange = useAtomValue(colorScheme.colorRangeAtom);
    const contourSpacing = useAtomValue(contourSpacingAtom);

    const hidden = useAtomValue(hiddenAtom);
    const opacity = useAtomValue(opacityAtom);

    const appearances: HeatmapAppearances = useMemo(
      () => ({
        heatMap: {
          valueMap: meshImageData?.image.toDataURL(),
          bounds: meshImageData?.bounds,
          colorMap: colorMap.lut,
          opacity,
          minValue: colorRange[0],
          maxValue: colorRange[1],
          contourSpacing,
        },
      }),
      [meshImageData, colorMap, opacity, colorRange, contourSpacing],
    );

    if (hidden || meshImageData == null) {
      return null;
    }
    return <ReEarthHeatmapLayer appearances={appearances} />;
  },
);

function extendRange(a: number[], b: number[]): [number, number] {
  invariant(a.length === 2);
  invariant(b.length === 2);
  return [Math.min(a[0], b[0]), Math.max(a[1], b[1])];
}

export const HeatmapLayer: FC<LayerProps<typeof HEATMAP_LAYER>> = ({ getUrl, codes, ...props }) => {
  const colorScheme = useAtomValue(props.colorSchemeAtom);
  invariant(colorScheme?.type === "quantitative");
  const setColorRange = useSetAtom(colorScheme.colorRangeAtom);
  const setValueRange = useSetAtom(colorScheme.valueRangeAtom);
  const setContourSpacing = useSetAtom(props.contourSpacingAtom);

  const handleLoad = useCallback(
    (data: ParseCSVResult) => {
      setValueRange(prevValue => extendRange(prevValue, [0, data.maxValue]));
      setContourSpacing(prevValue => Math.max(prevValue, data.outlierThreshold / 20));
      setColorRange(prevValue => extendRange(prevValue, [0, data.outlierThreshold]));
    },
    [setValueRange, setContourSpacing, setColorRange],
  );

  // TODO: Replace this logic with an API to load CSV when the primitive is visible.
  // This logic load all data by each chunk.
  const [managedCodes, setManagedCodes] = useState<string[]>([]);
  useEffect(() => {
    let nextChunk = 3;
    const time = setInterval(() => {
      setManagedCodes(codes.slice(0, nextChunk));
      if (nextChunk >= codes.length) {
        clearInterval(time);
      }
      nextChunk += 10;
    }, 300);
  }, [codes]);

  const propsArray = useMemo(
    () =>
      managedCodes.map(code => {
        const url = getUrl(code);
        const meshType = inferMeshType(code);
        if (url == null || meshType == null) {
          return undefined;
        }
        // const bounds = convertCodeToBounds(code, meshType);
        // const boundingSphere = BoundingSphere.fromRectangle3D(
        //   Rectangle.fromDegrees(bounds.west, bounds.south, bounds.east, bounds.north),
        // );
        return { url };
      }),
    [getUrl, managedCodes],
  );
  return (
    <>
      {propsArray.map(
        additionalProps =>
          additionalProps != null && (
            <Subdivision
              key={additionalProps.url}
              {...props}
              {...additionalProps}
              onLoad={handleLoad}
            />
          ),
      )}
    </>
  );
};
