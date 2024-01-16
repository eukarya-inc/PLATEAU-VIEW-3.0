import AddIcon from "@mui/icons-material/Add";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import CopyAllOutlinedIcon from "@mui/icons-material/CopyAllOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { Box, Typography, styled } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import React, { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";

import { AddLayerOptions } from "../../../prototypes/layers/states";
import { MY_DATA_LAYER } from "../../../prototypes/view-layers";
import { RootLayerConfig, createRootLayerForLayerAtom } from "../../view-layers/rootLayer";
import { Label } from "../Label";
import { StyledButton } from "../StyledButton";

import FileTypeSelect, { FileType } from "./LocalFileTypeSelect";
import { UserDataItem } from "./types";
import { getExtension } from "./utils/files";

type Props = {
  fileName: string;
  selectedLocalItem?: UserDataItem;
  onAddLayer: (
    layer: Omit<RootLayerConfig, "id">,
    options?: AddLayerOptions | undefined,
  ) => () => void;
  onClose?: () => void;
  setFileName: (v: string) => void;
  setSelectedLocalItem?: (data?: UserDataItem) => void;
};

const LocalDataTab: React.FC<Props> = ({
  fileName,
  selectedLocalItem,
  onClose,
  onAddLayer,
  setFileName,
  setSelectedLocalItem,
}) => {
  const [fileType, setFileType] = useState<FileType>("auto");

  const setDataFormat = useCallback((type: FileType, filename: string) => {
    const extension = getExtension(filename);
    if (type === "auto") {
      switch (extension) {
        // 3dtiles
        case "json":
          return "json";
        // georss
        case "rss":
          return "rss";
        // georss
        case "xml":
          return "xml";
        // shapefile
        case "zip":
          return "zip";
        default:
          return extension;
      }
    }
    return type;
  }, []);

  const proccessedData = useCallback(
    async (fileName: string, acceptedFiles: any) => {
      const reader = new FileReader();

      const content = await new Promise<string | ArrayBuffer | null>(resolve => {
        reader.onload = () => resolve(reader.result);
        reader.readAsText(acceptedFiles[0]);
      });

      const url = (() => {
        if (!content) {
          return;
        }
        return "data:text/plain;charset=UTF-8," + encodeURIComponent(content.toString());
      })();
      const format = setDataFormat(fileType, fileName);
      const id = "id" + Math.random().toString(16).slice(2);
      const item: UserDataItem = {
        type: "item",
        id: id,
        dataID: id,
        description: `このファイルはローカルにのみ存在します。このデータを共有するには、データをアップロードし、パブリックなウェブブラウザで公開してください。${
          format === "csv"
            ? "<br/><br/>パフォーマンス上の問題が発生するため、6000レコード以上を含むCSVファイルをアップロードしないでください。"
            : ""
        }`,
        name: fileName,
        visible: true,
        url: url,
        format,
      };
      if (setSelectedLocalItem) setSelectedLocalItem(item);
      return false;
    },
    [fileType, setDataFormat, setSelectedLocalItem],
  );

  const onDrop = useCallback(
    (acceptedFiles: any) => {
      if (acceptedFiles.length > 0) {
        const fileName = acceptedFiles[0].name;
        setFileName(fileName);
        proccessedData(fileName, acceptedFiles);
      }
    },
    [proccessedData, setFileName],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
  });

  const handleCancel = useCallback(() => {
    setFileName("");
  }, [setFileName]);

  const disabled = useMemo(() => {
    if (fileName) return false;
    return true;
  }, [fileName]);

  const handleFileTypeSelect = useCallback((type: string) => {
    setFileType(type as FileType);
  }, []);

  const handleSubmit = useCallback(() => {
    if (selectedLocalItem) {
      onAddLayer(
        createRootLayerForLayerAtom({
          title: selectedLocalItem.name ?? "",
          format: selectedLocalItem?.format,
          type: MY_DATA_LAYER,
          url: selectedLocalItem?.url,
          id: selectedLocalItem?.dataID,
        }),
        { autoSelect: false },
      );
    }
    onClose?.();
  }, [onAddLayer, onClose, selectedLocalItem]);

  return (
    <FormControl fullWidth size="small">
      <Label>ファイルタイプを選択</Label>
      <FileTypeSelect fileType={fileType} onFileTypeSelect={handleFileTypeSelect} />

      <Label>ファイルをアップロード</Label>
      <DropzoneAreaWrapper>
        <div {...getRootProps({ className: "dropzone" })}>
          <input {...getInputProps()} />
          <CopyAllOutlinedIcon sx={{ margin: "0 120px" }} fontSize="large" />
          <Typography id="modal-modal-description" sx={{ mt: 2, mb: 1 }} variant="body1">
            ここをクリックしてファイルを選択するか <br />{" "}
            ファイルをここにドラッグ＆ドロップしてください
          </Typography>
        </div>
      </DropzoneAreaWrapper>

      {fileName && (
        <>
          <Box sx={{ display: "flex", gap: "10px", border: "1px solid #0000001f", padding: "8px" }}>
            <DescriptionOutlinedIcon />
            <Typography>{fileName}</Typography>
            <CancelIcon sx={{ cursor: "pointer" }} onClick={handleCancel} />
          </Box>
          <Typography id="modal-modal-description" sx={{ mt: 2, mb: 1 }}>
            このファイルはローカルにのみ存在します。このデータを共有するには、データをアップロードし、パブリックなウェブブラウザで公開してください。
          </Typography>
        </>
      )}
      <StyledButton
        startIcon={<AddIcon />}
        disabled={disabled}
        type="submit"
        onClick={handleSubmit}>
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
}));

const CancelIcon = styled(ClearOutlinedIcon)(({ theme }) => ({
  color: theme.palette.text.primary,
  marginLeft: "auto",
}));

export default LocalDataTab;
