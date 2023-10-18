import { styled } from "@mui/material";
import { green, red } from "@mui/material/colors";

import { Dataset } from "../../../../shared/api/types";
import { BlockContentWrapper } from "../../../ui-components";
import { EditorCommonField } from "../../../ui-components/editor/EditorCommonField";
import { EditorTextField } from "../../../ui-components/editor/EditorTextField";

import { BasicBlock, BasicBlockProps } from "./BasicBlock";

type StatusBlockProps = BasicBlockProps & {
  dataset?: Dataset;
};

export const StatusBlock: React.FC<StatusBlockProps> = ({ dataset, ...props }) => {
  return (
    <BasicBlock title="Status" expandable {...props}>
      <BlockContentWrapper>
        <EditorCommonField label="Status">
          <PublishStatus published={dataset?.published}>
            {dataset?.published ? "CMS公開済" : "CMS未公開"}
          </PublishStatus>
        </EditorCommonField>
        <EditorTextField label="Created At" value={""} disabled />
        <EditorTextField label="Updated At" value={""} disabled />
        <EditorTextField label="CMS URL" value={""} multiline disabled rows={4} />
      </BlockContentWrapper>
    </BasicBlock>
  );
};

const PublishStatus = styled("div")<{ published?: boolean }>(({ theme, published }) => ({
  display: "inline-block",
  padding: theme.spacing(0.4, 1),
  fontSize: theme.typography.body2.fontSize,
  color: published ? theme.palette.success.main : theme.palette.error.main,
  border: published ? `1px solid ${green[200]}` : `1px solid ${red[200]}`,
  backgroundColor: published ? green[100] : red[100],
  borderRadius: theme.shape.borderRadius,
}));
