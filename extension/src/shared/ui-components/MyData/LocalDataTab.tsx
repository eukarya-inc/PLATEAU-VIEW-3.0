import AddIcon from "@mui/icons-material/Add";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import CopyAllOutlinedIcon from "@mui/icons-material/CopyAllOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { Box, Typography, styled } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import React, { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";

import { getExtension } from "../../utils/file";

import { Label } from "./Label";
import FileTypeSelect, { FileType } from "./LocalFileTypeSelect";
import { StyledButton } from "./StyledButton";
import { UserDataItem } from "./types";
import { decodeDataURL, getAdditionalData, getFormatTip } from "./utils";

type Props = {
  onSubmit: (selectedItem: UserDataItem) => void;
};

const LocalDataTab: React.FC<Props> = ({ onSubmit }) => {
  const [fileType, setFileType] = useState<FileType>("auto");

  const [processedDataItem, setProcessedDataItem] = useState<
    | {
        fileName: string;
        contentString: string | null;
        url: string | undefined;
      }
    | undefined
  >(undefined);

  const processData = useCallback(async (acceptedFiles: any) => {
    const fileName = acceptedFiles[0].name;
    const reader = new FileReader();
    const content = await new Promise<string | ArrayBuffer | null>(
      (resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(acceptedFiles[0]);
      }
    );
    const url = content as string;
    const contentString = decodeDataURL(String(content));
    setProcessedDataItem({
      fileName,
      contentString,
      url,
    });
  }, []);

  const selectedLocalItem: UserDataItem | undefined = useMemo(() => {
    if (!processedDataItem) return undefined;
    const format = getFormat(fileType, processedDataItem.fileName);
    const id = "id" + Math.random().toString(16).slice(2);
    const item: UserDataItem = {
      type: "item",
      id: id,
      dataID: id,
      formatTip: getFormatTip(format),
      description:
        "このファイルはローカルにのみ存在します。このデータを共有するには、データをアップロードし、パブリックなウェブブラウザで公開してください。",
      name: processedDataItem.fileName,
      visible: true,
      url: processedDataItem.url,
      format,
      additionalData: getAdditionalData(
        processedDataItem.contentString,
        format
      ),
    };
    return item;
  }, [processedDataItem, fileType]);

  const onDrop = useCallback(
    (acceptedFiles: any) => {
      if (acceptedFiles.length > 0) {
        processData(acceptedFiles);
      }
    },
    [processData]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
  });

  const handleFileTypeSelect = useCallback((type: string) => {
    setFileType(type as FileType);
  }, []);

  const handleSubmit = useCallback(() => {
    if (selectedLocalItem) {
      onSubmit(selectedLocalItem);
    }
    setProcessedDataItem(undefined);
  }, [onSubmit, selectedLocalItem]);

  return (
    <FormControl fullWidth size="small">
      <Label>ファイルタイプを選択</Label>
      <FileTypeSelect
        fileType={fileType}
        onFileTypeSelect={handleFileTypeSelect}
      />

      <Label>ファイルをアップロード</Label>
      <DropzoneAreaWrapper>
        <div {...getRootProps({ className: "dropzone" })}>
          <input {...getInputProps()} />
          <StyledCopyIcon fontSize="large" />
          <Typography
            id="modal-modal-description"
            sx={{ mt: 2, mb: 1 }}
            variant="body1"
          >
            ここをクリックしてファイルを選択するか <br />{" "}
            ファイルをここにドラッグ＆ドロップしてください
          </Typography>
        </div>
      </DropzoneAreaWrapper>

      {selectedLocalItem && (
        <Box
          sx={{
            display: "flex",
            gap: "10px",
            border: "1px solid #0000001f",
            padding: "8px",
          }}
        >
          <DescriptionOutlinedIcon />
          <Typography>{selectedLocalItem.name}</Typography>
          <CancelIcon
            sx={{ cursor: "pointer" }}
            onClick={() => setProcessedDataItem(undefined)}
          />
        </Box>
      )}
      {(fileType !== "auto" || selectedLocalItem) && (
        <Typography id="modal-modal-format-tip" sx={{ mt: 2, mb: 0 }}>
          {selectedLocalItem
            ? selectedLocalItem.formatTip
            : getFormatTip(fileType)}
        </Typography>
      )}
      <Typography id="modal-modal-description" sx={{ mt: 2, mb: 1 }}>
        このファイルはローカルにのみ存在します。このデータを共有するには、データをアップロードし、パブリックなウェブブラウザで公開してください。
      </Typography>
      <StyledButton
        startIcon={<AddIcon />}
        disabled={!selectedLocalItem}
        onClick={handleSubmit}
      >
        シーンに追加
      </StyledButton>
    </FormControl>
  );
};

const DropzoneAreaWrapper = styled("section")(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: theme.spacing(1.8),
  cursor: "pointer",
}));

const CancelIcon = styled(ClearOutlinedIcon)(({ theme }) => ({
  color: theme.palette.text.primary,
  marginLeft: "auto",
}));

const StyledCopyIcon = styled(CopyAllOutlinedIcon)(({ theme }) => ({
  margin: "0 120px",
  [theme.breakpoints.down("mobile")]: {
    margin: "0 70px",
  },
}));

export default LocalDataTab;

function getFormat(type: FileType, filename: string) {
  const extension = getExtension(filename);
  return type === "auto"
    ? extension === "zip"
      ? "shapefile"
      : extension
    : type;
}
