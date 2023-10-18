import { Dataset } from "../../../../shared/api/types";
import { EditorBlock, EditorBlockProps } from "../../../ui-components";
import { DraftSetting } from "../editorContainers/dataset";

export type BasicBlockProps = EditorBlockProps & {
  dataset?: Dataset;
  setting?: DraftSetting;
  dataId?: string;
  updateSetting?: React.Dispatch<React.SetStateAction<DraftSetting | undefined>>;
};

export const BasicBlock: React.FC<BasicBlockProps> = props => {
  return <EditorBlock {...props} />;
};
