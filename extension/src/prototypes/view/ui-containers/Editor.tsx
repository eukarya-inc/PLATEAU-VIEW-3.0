import { useAtomValue } from "jotai";
import { type FC, useState, useMemo, useCallback } from "react";

import { useDatasetsAPI } from "../../../shared/api";
import { EditorBar, EditorPanel } from "../../ui-components";
import { LAYER_SELECTION, selectionGroupsAtom } from "../states/selection";

import { EditorDatasetSection } from "./EditorDatasetSection";

export const Editor: FC = () => {
  const { datasetsAtom } = useDatasetsAPI();
  const datasets = useAtomValue(datasetsAtom);

  const selectionGroups = useAtomValue(selectionGroupsAtom);
  const selectedSingleLayer = useMemo(
    () =>
      selectionGroups.length === 1 && selectionGroups[0].type === LAYER_SELECTION
        ? selectionGroups[0].values[0]
        : null,
    [selectionGroups],
  );

  const [editorType, setEditorType] = useState("dataset");

  const editorTypes = useMemo(
    () => [
      {
        title: "Dataset Editor",
        value: "dataset",
      },
      {
        title: "Field Components Template Editor",
        value: "fieldComponentsTemplate",
      },
      {
        title: "Inspector Emphasis Property Template Editor",
        value: "inspectorEmphasisPropertyTemplate",
      },
    ],
    [],
  );

  const handleEditorTypeChange = useCallback((editorType: string) => {
    setEditorType(editorType);
  }, []);

  return (
    <>
      <EditorBar
        editorTypes={editorTypes}
        editorType={editorType}
        onEditorTypeChange={handleEditorTypeChange}
      />
      <EditorPanel>
        {editorType === "dataset" ? (
          <EditorDatasetSection layer={selectedSingleLayer} datasets={datasets} />
        ) : editorType === "fieldComponentsTemplate" ? (
          <>{editorType}</>
        ) : editorType === "inspectorEmphasisPropertyTemplate" ? (
          <>{editorType}</>
        ) : null}
      </EditorPanel>
    </>
  );
};
