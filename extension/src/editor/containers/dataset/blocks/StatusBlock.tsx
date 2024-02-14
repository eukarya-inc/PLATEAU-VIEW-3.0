import { Switch, styled } from "@mui/material";
import { green, red } from "@mui/material/colors";
import { useCallback, useMemo } from "react";

import { DraftSetting, EditorDataset, UpdateSetting } from "..";
import {
  BlockContentWrapper,
  EditorBlock,
  EditorBlockProps,
  EditorCommonField,
  EditorTextField,
} from "../../ui-components";

type StatusBlockProps = EditorBlockProps & {
  dataset?: EditorDataset;
  setting: DraftSetting;
  updateSetting?: UpdateSetting;
};

export const StatusBlock: React.FC<StatusBlockProps> = ({
  dataset,
  setting,
  updateSetting,
  ...props
}) => {
  const isDefaultTile = useMemo(
    () => setting?.status?.isDefaultTile,
    [setting?.status?.isDefaultTile],
  );

  const handleSettingsUpdate = useCallback(
    () =>
      updateSetting?.(s =>
        !s ? s : { ...s, status: { ...s.status, isDefaultTile: !isDefaultTile } },
      ),
    [isDefaultTile, updateSetting],
  );

  return (
    <EditorBlock title="Status" expandable {...props}>
      <BlockContentWrapper>
        <EditorCommonField label="Status" inline>
          <PublishStatus published={dataset?.published}>
            {dataset?.published ? "CMS公開済" : "CMS未公開"}
          </PublishStatus>
        </EditorCommonField>
        <EditorTextField label="Created At" value={""} disabled />
        <EditorTextField label="Updated At" value={""} disabled />
        <EditorTextField label="CMS URL" value={""} multiline disabled rows={4} />
        <EditorCommonField label="デフォルトタイル" inline>
          <Switch checked={isDefaultTile} onChange={handleSettingsUpdate} />
        </EditorCommonField>
      </BlockContentWrapper>
    </EditorBlock>
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
