import { DraftSetting, UpdateSetting } from "..";
import { BlockContentWrapper, EditorBlock, EditorBlockProps } from "../../../../../ui-components";
import { EditorCommonField } from "../../../../../ui-components/editor/EditorCommonField";

type DataFetchingBlockProps = EditorBlockProps & {
  setting?: DraftSetting;
  updateSetting?: UpdateSetting;
};

export const DataFetchingBlock: React.FC<DataFetchingBlockProps> = () => {
  return (
    <EditorBlock title="Data Fetching" expandable>
      <BlockContentWrapper>
        <EditorCommonField label="Enable realtime data fetching" />
      </BlockContentWrapper>
    </EditorBlock>
  );
};
