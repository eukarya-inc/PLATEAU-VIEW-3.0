import { Dataset } from "../../../../shared/api/types";
import { EditorBlock, BlockContentWrapper } from "../../../ui-components/EditorBlock";

type StatusBlockProps = {
  dataset?: Dataset;
};

export const StatusBlock: React.FC<StatusBlockProps> = ({ dataset }) => {
  return (
    <EditorBlock title="Status" expandable>
      <BlockContentWrapper>{JSON.stringify(dataset?.id)}</BlockContentWrapper>
    </EditorBlock>
  );
};
