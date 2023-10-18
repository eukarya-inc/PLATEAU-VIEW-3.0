import { styled, Typography } from "@mui/material";
import { useAtomValue } from "jotai";
import { useCallback, useMemo, useState, type FC, useEffect } from "react";

import { useDatasetsAPI, useSettingsAPI } from "../../../../../shared/api";
import { Setting } from "../../../../../shared/api/types";
import {
  EditorSection,
  EditorTree,
  EditorTreeItem,
  EditorTreeSelection,
} from "../../../../ui-components";
import { LAYER_SELECTION, selectionGroupsAtom } from "../../../states/selection";

import { GeneralPage } from "./GeneralPage";
import { StatusPage } from "./StatusPage";

export type EditorDatasetSectionProps = {};

export type EditorDatasetConentType =
  | "status"
  | "folder"
  | "general"
  | "fieldComponents"
  | "featureInspector";

export type EditorDatasetItemProperty = {
  dataId?: string;
  type?: EditorDatasetConentType;
};

export type DraftSetting = Omit<Setting, "id"> & {
  id?: string;
};

export type UpdateSetting = React.Dispatch<React.SetStateAction<DraftSetting | undefined>>;

export const EditorDatasetSection: FC<EditorDatasetSectionProps> = () => {
  const [ready, setReady] = useState(false);
  const [contentType, setContentType] = useState<EditorDatasetConentType>();
  const [dataId, setDataId] = useState<string | undefined>();

  const { datasetsAtom } = useDatasetsAPI();
  const { settingsAtom } = useSettingsAPI();
  const datasets = useAtomValue(datasetsAtom);
  const settings = useAtomValue(settingsAtom);

  const selectionGroups = useAtomValue(selectionGroupsAtom);
  const layer = useMemo(
    () =>
      selectionGroups.length === 1 && selectionGroups[0].type === LAYER_SELECTION
        ? selectionGroups[0].values[0]
        : null,
    [selectionGroups],
  );

  const dataset = useMemo(() => datasets.find(d => d.id === layer?.id), [layer, datasets]);

  const tree = useMemo(() => {
    setReady(false);
    if (!dataset) return [];
    return [
      {
        id: `${dataset.id}-status`,
        name: "Status",
        property: {
          type: "status",
        },
      },
      {
        id: `${dataset.id}-default`,
        name: "Default",
        property: {
          dataId: "default",
          type: "folder",
        },
        children: [
          {
            name: "General",
            id: `${dataset.id}-default-general`,
            property: {
              dataId: "default",
              type: "general",
            },
          },
          {
            name: "Field Components",
            id: `${dataset.id}-default-fieldComponents`,
            property: {
              dataId: "default",
              type: "fieldComponents",
            },
          },
          {
            name: "Feature Inspector",
            id: `${dataset.id}-default-featureInspector`,
            property: {
              dataId: "default",
              type: "featureInspector",
            },
          },
        ],
      },
      ...dataset.data.map(item => ({
        id: `${dataset.id}-${item.id}`,
        name: item.name,
        property: {
          dataId: item.id,
          type: "folder",
        },
        children: [
          {
            name: "General",
            id: `${dataset.id}-${item.id}-general`,
            property: {
              dataId: item.id,
              type: "general",
            },
          },
          {
            name: "Field Components",
            id: `${dataset.id}-${item.id}-fieldComponents`,
            property: {
              dataId: item.id,
              type: "fieldComponents",
            },
          },
          {
            name: "Feature Inspector",
            id: `${dataset.id}-${item.id}-featureInspector`,
            property: {
              dataId: item.id,
              type: "featureInspector",
            },
          },
        ],
      })),
    ] as EditorTreeItem[];
  }, [dataset]);

  const [draftSetting, updateDraftSetting] = useState<DraftSetting>();

  const [expanded, setExpanded] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    if (tree[0]) {
      setSelected(tree[0].id);
      setContentType("status");
      setDataId(undefined);
    }
    setExpanded(tree.map(item => item.id));
    setReady(true);
  }, [tree]);

  useEffect(() => {
    if (!dataset?.id || !dataId) return;
    updateDraftSetting(
      settings.find(s => s.datasetId === dataset.id && s.dataId === dataId) ?? {
        datasetId: dataset.id,
        dataId,
        general: {},
        fieldComponents: {},
        featureInspector: {},
      },
    );
  }, [dataId, dataset, settings]);

  const handleItemClick = useCallback(({ id, dataId, type }: EditorTreeSelection) => {
    setSelected(id);
    setContentType(type);
    setDataId(dataId);
  }, []);

  const handleExpandClick = useCallback(
    (id: string) => {
      if (expanded.includes(id)) {
        setExpanded(expanded.filter(e => e !== id));
      } else {
        setExpanded([...expanded, id]);
      }
    },
    [expanded],
  );

  const handleSave = useCallback(() => {
    console.log("save setting", draftSetting);
  }, [draftSetting]);

  const showSaveButton = useMemo(
    () => !!dataset?.id && !!dataId && contentType !== "folder",
    [dataset, dataId, contentType],
  );

  return layer ? (
    <EditorSection
      sidebarMain={
        <EditorTree
          tree={tree}
          selected={selected}
          expanded={expanded}
          ready={ready}
          onItemClick={handleItemClick}
          onExpandClick={handleExpandClick}
        />
      }
      main={
        <>
          {contentType === "status" ? (
            <StatusPage dataset={dataset} />
          ) : contentType === "general" ? (
            <GeneralPage
              dataset={dataset}
              dataId={dataId}
              setting={draftSetting}
              updateSetting={updateDraftSetting}
            />
          ) : contentType === "fieldComponents" ? (
            <>fieldComponents</>
          ) : contentType === "featureInspector" ? (
            <>featureInspector</>
          ) : null}
        </>
      }
      showSaveButton={showSaveButton}
      onSave={handleSave}
    />
  ) : (
    <Placeholder>
      <Typography variant="body1" color="text.secondary">
        Please select a layer.
      </Typography>
    </Placeholder>
  );
};

const Placeholder = styled("div")(({ theme }) => ({
  height: theme.spacing(6),
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));
