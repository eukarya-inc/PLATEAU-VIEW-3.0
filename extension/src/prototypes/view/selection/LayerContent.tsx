import { Divider, IconButton, List, Tooltip } from "@mui/material";
import { atom, useAtom, useAtomValue, useSetAtom, type SetStateAction } from "jotai";
import { Fragment, useCallback, useMemo } from "react";
import invariant from "tiny-invariant";

import { flyToLayerId } from "../../../shared/reearth/utils";
import { Fields } from "../../../shared/view/fields/Fields";
import { ComponentAtom } from "../../../shared/view-layers/component";
import { layerSelectionAtom, removeLayerAtom, type LayerType } from "../../layers";
import {
  AddressIcon,
  InfoIcon,
  InspectorHeader,
  InspectorItem,
  TrashIcon,
  VisibilityOffIcon,
  VisibilityOnIcon,
} from "../../ui-components";
import { layerTypeIcons, layerTypeNames } from "../../view-layers";
import { type LAYER_SELECTION, type SelectionGroup } from "../states/selection";

// import { LayerHeatmapSection } from "./LayerHeatmapSection";
import { LayerHiddenFeaturesSection } from "./LayerHiddenFeaturesSection";
// import { LayerShowWireframeSection } from "./LayerShowWireframeSection";
// import { LayerSketchSection } from "./LayerSketchSection";

export interface LayerContentProps<T extends LayerType> {
  values: (SelectionGroup & {
    type: typeof LAYER_SELECTION;
    subtype: T;
  })["values"];
}

export function LayerContent<T extends LayerType>({
  values,
}: LayerContentProps<T>): JSX.Element | null {
  invariant(values.length > 0);
  const type = values[0].type;

  const setSelection = useSetAtom(layerSelectionAtom);
  const handleClose = useCallback(() => {
    setSelection([]);
  }, [setSelection]);

  const hiddenAtom = useMemo(() => {
    const atoms = values.map(value => value.hiddenAtom);
    return atom(
      get => atoms.every(atom => get(atom)),
      (_get, set, value: SetStateAction<boolean>) => {
        atoms.forEach(atom => {
          set(atom, value);
        });
      },
    );
  }, [values]);

  const [hidden, setHidden] = useAtom(hiddenAtom);
  const handleToggleHidden = useCallback(() => {
    setHidden(value => !value);
  }, [setHidden]);

  const layerIdAtom = useMemo(
    () => atom(get => (values.length === 1 ? get(values[0].layerIdAtom) : null)),
    [values],
  );
  const layerId = useAtomValue(layerIdAtom);
  const handleMove = useCallback(() => {
    if (layerId) {
      flyToLayerId(layerId);
    }
  }, [layerId]);

  const remove = useSetAtom(removeLayerAtom);
  const handleRemove = useCallback(() => {
    values.forEach(value => {
      remove(value.id);
    });
  }, [values, remove]);

  const components = useMemo(() => {
    const result: { [K in ComponentAtom["type"]]?: ComponentAtom["atom"][] } = {};
    for (const layer of values) {
      for (const componentAtom of layer.componentAtoms ?? []) {
        if (result[componentAtom.type]) {
          result[componentAtom.type]?.push(componentAtom.atom);
          continue;
        }
        result[componentAtom.type] = [componentAtom.atom];
      }
    }
    return Object.entries(result) as [k: ComponentAtom["type"], v: ComponentAtom["atom"][]][];
  }, [values]);

  return (
    <List disablePadding>
      <InspectorHeader
        title={
          values.length === 1
            ? `${layerTypeNames[type]}レイヤー`
            : `${values.length}個の${layerTypeNames[type]}レイヤー`
        }
        iconComponent={layerTypeIcons[type]}
        actions={
          <>
            <Tooltip title={hidden ? "表示" : "隠す"}>
              <IconButton aria-label={hidden ? "表示" : "隠す"} onClick={handleToggleHidden}>
                {hidden ? <VisibilityOffIcon /> : <VisibilityOnIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="移動">
              <span>
                <IconButton aria-label="移動" disabled={layerId == null} onClick={handleMove}>
                  <AddressIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="出典">
              <span>
                <IconButton aria-label="出典" disabled>
                  <InfoIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="削除">
              <IconButton aria-label="削除" onClick={handleRemove}>
                <TrashIcon />
              </IconButton>
            </Tooltip>
          </>
        }
        onClose={handleClose}
      />
      <LayerHiddenFeaturesSection layers={values} />
      {/* <LayerHeatmapSection layers={values} /> */}
      {components.map(([type, atoms]) => (
        <Fragment key={type}>
          <Divider />
          <InspectorItem>
            <Fields layers={values} type={type} atoms={atoms} />
          </InspectorItem>
        </Fragment>
      ))}
      {/* <InspectorItem> */}
      {/* <LayerShowWireframeSection layers={values} />
        <LayerSketchSection layers={values} /> */}
      {/* </InspectorItem> */}
    </List>
  );
}
