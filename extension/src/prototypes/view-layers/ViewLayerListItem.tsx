import { IconButton, Tooltip } from "@mui/material";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { memo, useCallback, useMemo, type FC, type SyntheticEvent } from "react";

import { useOptionalAtomValue } from "../../shared/hooks";
import { flyToCamera, flyToLayerId, lookAtXYZ } from "../../shared/reearth/utils";
import { findRootLayerAtom } from "../../shared/states/rootLayer";
import { removeLayerAtom, type LayerProps, type LayerType } from "../layers";
import { ColorMapIcon, ColorSetIcon, ImageIconSetIcon, LayerListItem } from "../ui-components";

import { layerTypeIcons } from "./layerTypeIcons";
import {
  colorSchemeSelectionAtom,
  highlightedLayersAtom,
  imageSchemeSelectionAtom,
} from "./states";

function stopPropagation(event: SyntheticEvent): void {
  event.stopPropagation();
}

export type ViewLayerListItemProps<T extends LayerType = LayerType> = LayerProps<T>;

export const ViewLayerListItem: FC<ViewLayerListItemProps> = memo(
  (props: ViewLayerListItemProps) => {
    const {
      id,
      type,
      selected,
      titleAtom,
      loadingAtom,
      hiddenAtom,
      layerIdAtom,
      boundingSphereAtom,
      itemProps,
    } = props;

    const title = useAtomValue(titleAtom);
    const loading = useAtomValue(loadingAtom);

    const highlightedAtom = useMemo(
      () => atom(get => get(highlightedLayersAtom).some(layer => layer.id === id)),
      [id],
    );
    const highlighted = useAtomValue(highlightedAtom);

    const findRootLayer = useSetAtom(findRootLayerAtom);
    const rootLayer = findRootLayer(props.id);

    const layerId = useAtomValue(layerIdAtom);
    const layerCamera = useOptionalAtomValue(
      useMemo(() => ("cameraAtom" in props ? props.cameraAtom : undefined), [props]),
    );
    const boundingSphere = useAtomValue(boundingSphereAtom);
    const handleDoubleClick = useCallback(() => {
      const camera = rootLayer?.general?.camera;
      if (camera) {
        return flyToCamera(camera);
      }
      if (layerCamera) {
        return flyToCamera(layerCamera);
      }
      if (boundingSphere) {
        return lookAtXYZ(boundingSphere);
      }
      if (layerId) {
        return flyToLayerId(layerId);
      }
    }, [layerId, rootLayer?.general?.camera, layerCamera, boundingSphere]);

    const [hidden, setHidden] = useAtom(hiddenAtom);
    const handleToggleHidden = useCallback(() => {
      setHidden(value => !value);
    }, [setHidden]);

    const remove = useSetAtom(removeLayerAtom);
    const handleRemove = useCallback(() => {
      remove(id);
    }, [id, remove]);

    const colorScheme = useAtomValue(props.colorSchemeAtom);
    const colorMap = useAtomValue(
      useMemo(
        () =>
          atom(get =>
            colorScheme?.type === "quantitative" ? get(colorScheme.colorMapAtom) : null,
          ),
        [colorScheme],
      ),
    );
    const colorSetColors = useAtomValue(
      useMemo(
        () =>
          atom(get => (colorScheme?.type === "qualitative" ? get(colorScheme.colorsAtom) : null)),
        [colorScheme],
      ),
    );

    const [colorSchemeSelection, setColorSchemeSelection] = useAtom(colorSchemeSelectionAtom);
    const colorSchemeSelected = useMemo(
      () => colorSchemeSelection.includes(id),
      [id, colorSchemeSelection],
    );
    const handleColorSchemeClick = useCallback(() => {
      setColorSchemeSelection([id]);
    }, [id, setColorSchemeSelection]);

    const imageScheme = useAtomValue(props.imageSchemeAtom);
    const imageIcons = useAtomValue(
      useMemo(
        () =>
          atom(get => (imageScheme?.type === "imageIcon" ? get(imageScheme.imageIconsAtom) : null)),
        [imageScheme],
      ),
    );
    const [imageSchemeSelection, setImageSchemeSelection] = useAtom(imageSchemeSelectionAtom);
    const imageSchemeSelected = useMemo(
      () => imageSchemeSelection.includes(id),
      [id, imageSchemeSelection],
    );
    const handleImageSchemeClick = useCallback(() => {
      setImageSchemeSelection([id]);
    }, [id, setImageSchemeSelection]);

    return (
      <LayerListItem
        {...itemProps}
        title={title ?? undefined}
        iconComponent={layerTypeIcons[type]}
        highlighted={highlighted}
        selected={selected}
        loading={loading}
        hidden={hidden}
        accessory={
          colorMap != null ? (
            <Tooltip title={colorScheme?.name}>
              <IconButton
                aria-label={colorScheme?.name}
                onMouseDown={stopPropagation}
                onDoubleClick={stopPropagation}
                onClick={handleColorSchemeClick}>
                <ColorMapIcon colorMap={colorMap} selected={colorSchemeSelected} />
              </IconButton>
            </Tooltip>
          ) : colorSetColors != null ? (
            <Tooltip title={colorScheme?.name}>
              <IconButton
                aria-label={colorScheme?.name}
                onMouseDown={stopPropagation}
                onDoubleClick={stopPropagation}
                onClick={handleColorSchemeClick}>
                <ColorSetIcon colors={colorSetColors} selected={colorSchemeSelected} />
              </IconButton>
            </Tooltip>
          ) : imageIcons != null ? (
            <Tooltip title={imageScheme?.name}>
              <IconButton
                aria-label={imageScheme?.name}
                onMouseDown={stopPropagation}
                onDoubleClick={stopPropagation}
                onClick={handleImageSchemeClick}>
                <ImageIconSetIcon imageIcons={imageIcons} selected={imageSchemeSelected} />
              </IconButton>
            </Tooltip>
          ) : undefined
        }
        onDoubleClick={handleDoubleClick}
        onRemove={handleRemove}
        onToggleHidden={handleToggleHidden}
      />
    );
  },
) as unknown as <T extends LayerType = LayerType>(props: ViewLayerListItemProps<T>) => JSX.Element; // For generics
