import { IconButton, styled, useMediaQuery, useTheme } from "@mui/material";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo, useState, type FC, type MouseEvent, type ReactNode } from "react";

import { DatasetFragmentFragment } from "../../../shared/graphql/types/catalog";
import { rootLayersLayersAtom } from "../../../shared/states/rootLayer";
import { settingsAtom } from "../../../shared/states/setting";
import { templatesAtom } from "../../../shared/states/template";
import { createRootLayerAtom } from "../../../shared/view-layers";
import { removeLayerAtom, useAddLayer } from "../../layers";
import { DatasetTreeItem, InfoIcon, type DatasetTreeItemProps } from "../../ui-components";
import { datasetTypeIcons } from "../constants/datasetTypeIcons";
import { datasetTypeLayers } from "../constants/datasetTypeLayers";
import { PlateauDatasetType } from "../constants/plateau";

import { DatasetDialog } from "./DatasetDialog";

const Delimiter = styled("span")(({ theme }) => ({
  margin: `0 0.5em`,
  color: theme.palette.text.disabled,
}));

export function joinPath(values: string[]): ReactNode {
  return (values as ReactNode[]).reduce((prev, curr, index) => [
    prev,
    <Delimiter key={index}>/</Delimiter>,
    curr,
  ]);
}

export interface DatasetListItemProps
  extends Omit<DatasetTreeItemProps, "nodeId" | "icon" | "secondaryAction"> {
  municipalityCode: string;
  dataset: DatasetFragmentFragment;
}

export const DatasetListItem: FC<DatasetListItemProps> = ({
  dataset,
  municipalityCode,
  ...props
}) => {
  // TODO: Separate into hook
  const layer = useAtomValue(
    useMemo(
      () => atom(get => get(rootLayersLayersAtom).find(layer => layer.id === dataset.id)),
      [dataset],
    ),
  );

  const settings = useAtomValue(settingsAtom);
  const templates = useAtomValue(templatesAtom);

  const layerType = datasetTypeLayers[dataset.type.code as PlateauDatasetType];
  const addLayer = useAddLayer();
  const removeLayer = useSetAtom(removeLayerAtom);
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));
  const handleClick = useCallback(() => {
    if (layerType == null) {
      return;
    }
    if (layer == null) {
      const filteredSettings = settings.filter(s => s.datasetId === dataset.id);
      addLayer(
        createRootLayerAtom({
          dataset,
          settings: filteredSettings,
          templates,
          areaCode: municipalityCode,
        }),
        { autoSelect: !smDown },
      );
    } else {
      removeLayer(layer.id);
    }
  }, [
    dataset,
    layer,
    layerType,
    addLayer,
    removeLayer,
    smDown,
    municipalityCode,
    settings,
    templates,
  ]);

  const [infoOpen, setInfoOpen] = useState(false);
  const handleInfo = useCallback((event: MouseEvent) => {
    event.stopPropagation();
    setInfoOpen(true);
  }, []);
  const handleInfoClose = useCallback(() => {
    setInfoOpen(false);
  }, []);

  const Icon = datasetTypeIcons[dataset.type.code as PlateauDatasetType];
  return (
    <>
      <DatasetTreeItem
        nodeId={dataset.id}
        icon={<Icon />}
        selected={layer != null}
        disabled={layerType == null}
        secondaryAction={
          <IconButton size="small" onClick={handleInfo}>
            <InfoIcon />
          </IconButton>
        }
        onClick={handleClick}
        {...props}
      />
      <DatasetDialog
        open={infoOpen}
        dataset={dataset}
        municipalityCode={municipalityCode}
        onClose={handleInfoClose}
      />
    </>
  );
};
