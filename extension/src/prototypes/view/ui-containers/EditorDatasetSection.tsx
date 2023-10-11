import { styled, Typography } from "@mui/material";
import { useAtom } from "jotai";
import { atomWithReset } from "jotai/utils";
import { useCallback, useMemo, type FC } from "react";

import { Dataset } from "../../../shared/api/types";
import { BuildingLayerModel } from "../../../shared/view-layers";
import { EditorSection, EditorTreeItem, EditorTreeView } from "../../ui-components";

export type EditorDatasetSectionProps = {
  layer: BuildingLayerModel | null;
  datasets: Dataset[];
};

const expandedAtom = atomWithReset<string[]>([]);

export const EditorDatasetSection: FC<EditorDatasetSectionProps> = ({ layer, datasets }) => {
  const [expanded, setExpanded] = useAtom(expandedAtom);
  const handleNodeToggle = useCallback(
    (_: unknown, nodeIds: string[]) => {
      setExpanded(nodeIds);
    },
    [setExpanded],
  );

  const layerTreeItems = useMemo(() => {
    console.log("layer", layer);
    console.log("datasets", datasets);
    const dataset = datasets.find(d => d.id === layer?.id);
    const tree = dataset?.data.map(d => ({ name: d.name, id: d.id }));

    return dataset
      ? tree?.map(item => <EditorTreeItem nodeId={item.id} key={item.id} label={item.name} />)
      : null;
  }, [datasets, layer]);

  return layer ? (
    <EditorSection
      sidebar={
        <EditorTreeView expanded={expanded} onNodeToggle={handleNodeToggle}>
          {layerTreeItems}
        </EditorTreeView>
      }
      main={<>Main Content</>}
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
