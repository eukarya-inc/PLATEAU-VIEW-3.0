import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import CopyAllOutlinedIcon from "@mui/icons-material/CopyAllOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { Box, Typography, styled } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

import FileTypeSelect from "./LocalFileTypeSelect";

type Props = {
  fileName: string;
  setFileName: (v: string) => void;
};

const LocalDataTab: React.FC<Props> = ({ fileName, setFileName }) => {
  const onDrop = useCallback(
    (acceptedFiles: any) => {
      if (acceptedFiles.length > 0) {
        setFileName(acceptedFiles[0].name);
      }
    },
    [setFileName],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
  });

  const handleCancel = useCallback(() => {
    setFileName("");
  }, [setFileName]);

  return (
    <FormControl fullWidth size="small">
      <Label>ファイルタイプを選択</Label>
      <FileTypeSelect />

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
    </FormControl>
  );
};

const Label = styled("div")(() => ({
  fontSize: "0.875rem",
  marginBottom: "10px",
}));

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
