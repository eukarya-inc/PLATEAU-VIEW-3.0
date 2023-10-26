import LensBlurOutlinedIcon from "@mui/icons-material/LensBlurOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { styled, Typography } from "@mui/material";
import { useAtomValue } from "jotai";
import { useCallback, useMemo, useState, type FC, useEffect } from "react";

import { layerSelectionAtom } from "../../../prototypes/layers";
import {
  EditorButton,
  EditorSection,
  EditorTree,
  EditorTreeItemType,
  EditorTreeSelection,
} from "../../../prototypes/ui-components";
import { useSettingsAPI } from "../../../shared/api";
import { Setting } from "../../../shared/api/types";
import { useDatasetById } from "../../../shared/graphql";
import { DatasetFragmentFragment } from "../../../shared/graphql/types/catalog";
import { EditorCache } from "../useCache";
import { generateID } from "../utils";

import { FeatureInspectorPage } from "./FeatureInspectorPage";
import { FieldComponentsPage } from "./FieldComponentsPage";
import { GeneralPage } from "./GeneralPage";
import { StatusPage } from "./StatusPage";

// TODO: use plateview dataset type
export type EditorDataset = DatasetFragmentFragment & {
  published?: boolean;
};

export type EditorDatasetSectionProps = {
  cache?: EditorCache;
};

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

export const EditorDatasetSection: FC<EditorDatasetSectionProps> = ({ cache }) => {
  const [ready, setReady] = useState(false);
  const [contentType, setContentType] = useState<EditorDatasetConentType>();
  const [dataId, setDataId] = useState<string | undefined>();

  const { settingsAtom } = useSettingsAPI();
  const settings = useAtomValue(settingsAtom);

  const layer = useAtomValue(layerSelectionAtom)?.[0];
  const query = useDatasetById(layer ?? "");

  const dataset = useMemo(() => {
    return query.data?.node;
  }, [query]);

  const tree = useMemo(() => {
    setReady(false);
    if (!dataset) return [];
    return [
      {
        id: `${dataset.id}-status`,
        name: "Status",
        property: {
          dataId: "status",
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
      ...dataset.items.map(item => ({
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
    ] as EditorTreeItemType[];
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
    // get cache
    const cacheSetting = cache?.get(`dataset-${dataset.id}-${dataId}`);

    updateDraftSetting(
      cacheSetting
        ? cacheSetting
        : settings.find(s => s.datasetId === dataset.id && s.dataId === dataId) ?? {
            datasetId: dataset.id,
            dataId,
            general: {},
            fieldComponents: {},
            featureInspector: {},
          },
    );
  }, [dataId, dataset, settings, cache]);

  const handleItemClick = useCallback(
    ({ id, dataId: newDataId, type }: EditorTreeSelection) => {
      // save cache
      if (draftSetting) {
        cache?.set(`dataset-${dataset.id}-${dataId}`, { ...draftSetting });
      }
      // update state
      setSelected(id);
      setContentType(type);
      setDataId(newDataId);
    },
    [cache, dataset, dataId, draftSetting],
  );

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

  // setting must have a defulat component group
  useEffect(() => {
    if (!draftSetting) return;
    if (!draftSetting.fieldComponents?.groups || draftSetting.fieldComponents.groups.length === 0) {
      updateDraftSetting({
        ...draftSetting,
        fieldComponents: {
          ...draftSetting.fieldComponents,
          groups: [
            {
              id: generateID(),
              name: "Default",
              components: [],
            },
          ],
        },
      });
    }
  }, [draftSetting]);

  const handleSave = useCallback(() => {
    console.log("TODO: Save setting", draftSetting);
  }, [draftSetting]);

  const handleApply = useCallback(() => {
    console.log("TODO: Apply setting", draftSetting);
  }, [draftSetting]);

  return layer && dataset ? (
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
      sidebarBottom={
        <>
          <EditorButton
            startIcon={<LensBlurOutlinedIcon />}
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleApply}>
            Apply All
          </EditorButton>
          <EditorButton
            startIcon={<SaveOutlinedIcon />}
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSave}>
            Save All
          </EditorButton>
        </>
      }
      main={
        ready && (
          <>
            {contentType === "status" ? (
              <StatusPage dataset={dataset} />
            ) : contentType === "general" ? (
              <GeneralPage
                key={`${dataset.id}-${dataId}`}
                dataset={dataset}
                dataId={dataId}
                setting={draftSetting}
                updateSetting={updateDraftSetting}
              />
            ) : contentType === "fieldComponents" && draftSetting ? (
              <FieldComponentsPage
                key={`${dataset.id}-${dataId}`}
                setting={draftSetting}
                updateSetting={updateDraftSetting}
              />
            ) : contentType === "featureInspector" && draftSetting ? (
              <FeatureInspectorPage
                key={`${dataset.id}-${dataId}`}
                setting={draftSetting}
                updateSetting={updateDraftSetting}
              />
            ) : null}
          </>
        )
      }
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
