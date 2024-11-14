import { styled } from "@mui/material";
import { useMemo } from "react";

import { EditorDataset } from "..";
import {
  BlockContentWrapper,
  EditorBlock,
  EditorBlockProps,
  EditorCommonField,
  EditorTextField,
} from "../../ui-components";

type StatusBlockProps = EditorBlockProps & {
  dataset?: EditorDataset;
};

export const StatusBlock: React.FC<StatusBlockProps> = ({ dataset, ...props }) => {
  const status: {
    value: "alpha" | "beta" | "published";
    label: string;
  } = useMemo(
    () =>
      dataset?.admin?.stage === "alpha"
        ? { value: "alpha", label: "登録中" }
        : dataset?.admin?.stage === "beta"
        ? { value: "beta", label: "レビュー待ち" }
        : { value: "published", label: "公開済" },
    [dataset?.admin?.stage],
  );

  const localCreatedAt = useMemo(
    () => UTCTimeToLocalTime(dataset?.admin?.createdAt),
    [dataset?.admin?.createdAt],
  );
  const localUpdatedAt = useMemo(
    () => UTCTimeToLocalTime(dataset?.admin?.updatedAt),
    [dataset?.admin?.updatedAt],
  );

  return (
    <EditorBlock title="Status" expandable {...props}>
      <BlockContentWrapper>
        <EditorCommonField label="Status" inline>
          <PublishStatus status={status.value}>{status.label}</PublishStatus>
        </EditorCommonField>
        <EditorTextField label="Created At" value={localCreatedAt} disabled />
        <EditorTextField label="Updated At" value={localUpdatedAt} disabled />
        <EditorTextField
          label="CMS URL"
          value={dataset?.admin?.cmsUrl ?? ""}
          multiline
          disabled
          rows={8}
        />
      </BlockContentWrapper>
    </EditorBlock>
  );
};

const PublishStatus = styled("div")<{ status: "alpha" | "beta" | "published" }>(
  ({ theme, status }) => ({
    display: "inline-block",
    padding: theme.spacing(0.4, 1),
    fontSize: theme.typography.body2.fontSize,
    color: status === "alpha" ? "#595959" : status === "beta" ? "#FAAD14" : "#52C41A",
    border: `1px solid ${
      status === "alpha" ? "#D9D9D9" : status === "beta" ? "#FFE58F" : "#B7EB8F"
    }`,
    backgroundColor: status === "alpha" ? "#FAFAFA" : status === "beta" ? "#FFFBE6" : "#F6FFED",
    borderRadius: theme.shape.borderRadius,
  }),
);

function UTCTimeToLocalTime(utcTime: string): string {
  if (!utcTime) return "";
  return new Date(utcTime).toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
