import { type FC, useState, useMemo, useCallback } from "react";

import { EditorBar, EditorPanel } from "../../../ui-components";

import { EditorFieldComponentsTemplateSection } from "./componentTemplate";
import { EditorDatasetSection } from "./dataset";
import { EditorInspectorEmphasisPropertyTemplateSection } from "./emphasisPropertyTemplate";
import useCache from "./useCache";

export const PLATEAUVIEW_EDITOR_DOM_ID = "__plateauview_editor__";

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

  const cache = useCache();

  return (
    <div id={PLATEAUVIEW_EDITOR_DOM_ID}>
      <EditorBar
        editorTypes={editorTypes}
        editorType={editorType}
        onEditorTypeChange={handleEditorTypeChange}
      />
      <EditorPanel>
        {editorType === "dataset" ? (
          <EditorDatasetSection cache={cache} />
        ) : editorType === "fieldComponentsTemplate" ? (
          <EditorFieldComponentsTemplateSection />
        ) : editorType === "inspectorEmphasisPropertyTemplate" ? (
          <EditorInspectorEmphasisPropertyTemplateSection />
        ) : null}
      </EditorPanel>
    </div>
  );
};
