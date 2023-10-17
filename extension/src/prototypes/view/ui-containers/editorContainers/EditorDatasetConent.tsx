import { Dataset, Setting } from "../../../../shared/api/types";
import { StatusBlock } from "../editorBlocks/StatusBlock";

import { EditorDatasetConentType } from "./EditorDatasetSection";

export type EditorDatasetConentProps = {
  type?: EditorDatasetConentType;
  dataset?: Dataset;
  setting?: Setting;
};

export const EditorDatasetConent: React.FC<EditorDatasetConentProps> = ({ type, dataset }) => {
  return (
    <>
      {type === "status" ? (
        <StatusBlock dataset={dataset} />
      ) : type === "general" ? (
        <>general</>
      ) : type === "fieldComponents" ? (
        <>fieldComponents</>
      ) : type === "featureInspector" ? (
        <>featureInspector</>
      ) : null}
    </>
  );
};
