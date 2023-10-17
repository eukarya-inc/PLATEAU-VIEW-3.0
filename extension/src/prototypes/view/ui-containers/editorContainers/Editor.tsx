import { type FC, useState, useMemo, useCallback } from "react";

import { EditorBar, EditorPanel } from "../../../ui-components";

import { EditorDatasetSection } from "./EditorDatasetSection";
import { EditorFieldComponentsTemplateSection } from "./EditorFieldComponentsTemplateSection";
import { EditorInspectorEmphasisPropertyTemplateSection } from "./EditorInspectorEmphasisPropertyTemplateSection";

export const Editor: FC = () => {
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
          <EditorDatasetSection />
        ) : editorType === "fieldComponentsTemplate" ? (
          <EditorFieldComponentsTemplateSection />
        ) : editorType === "inspectorEmphasisPropertyTemplate" ? (
          <EditorInspectorEmphasisPropertyTemplateSection />
        ) : null}
      </EditorPanel>
    </>
  );
};
