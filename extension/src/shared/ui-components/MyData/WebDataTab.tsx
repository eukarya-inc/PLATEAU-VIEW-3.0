import { Input, inputClasses } from "@mui/base/Input";
import AddIcon from "@mui/icons-material/Add";
import { Button, Typography, styled } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import { Fragment, useCallback, useMemo, useState } from "react";

import { AddLayerOptions } from "../../../prototypes/layers/states";
import { getExtension } from "../../utils/files";
import { RootLayerConfig } from "../../view-layers/rootLayer";
import { Label } from "../Label";
import { StyledButton } from "../StyledButton";

import { UserDataItem } from "./types";
import { handleDataSetSubmit } from "./utils";
import WebFileTypeSelect, { FileType, getSupportedType } from "./WebFileTypeSelect";

type Props = {
  onAddLayer: (
    layer: Omit<RootLayerConfig, "id">,
    options?: AddLayerOptions | undefined,
  ) => () => void;
  onClose?: () => void;
};

const WebDataTab: React.FC<Props> = ({ onAddLayer, onClose }) => {
  const [fileType, setFileType] = useState<FileType>("auto");
  const [dataUrl, setDataUrl] = useState("");
  const [selectedWebItem, setSelectedWebItem] = useState<UserDataItem>();

  const handleFileTypeSelect = useCallback((type: string) => {
    setFileType(type as FileType);
  }, []);

  const handleSetUrl = useCallback((value: string) => {
    setDataUrl(value);
  }, []);

  const setDataFormat = useCallback((type: FileType, filename: string) => {
    if (type === "auto") {
      let extension = getSupportedType(filename);
      if (!extension) extension = getExtension(filename);
      return extension;
    }
    return type;
  }, []);

  const handleClick = useCallback(async () => {
    // Catalog Item
    const filename = dataUrl.substring(dataUrl.lastIndexOf("/") + 1);
    const id = "id" + Math.random().toString(16).slice(2);
    const format = setDataFormat(fileType, filename);

    const item: UserDataItem = {
      type: "item",
      id: id,
      dataID: id,
      description: `著作権や制約に関する情報などの詳細については、このデータの提供者にお問い合わせください。${
        format === "csv"
          ? "<br/><br/>パフォーマンス上の問題が発生するため、6000レコード以上を含むCSVファイルをアップロードしないでください。"
          : ""
      }`,
      name: filename,
      url: dataUrl,
      visible: true,
      format,
    };
    if (setSelectedWebItem) setSelectedWebItem(item);
  }, [dataUrl, fileType, setDataFormat, setSelectedWebItem]);

  const handleSubmit = useCallback(() => {
    selectedWebItem && handleDataSetSubmit(selectedWebItem, onAddLayer, onClose);
    setSelectedWebItem(undefined);
  }, [onAddLayer, onClose, selectedWebItem]);

  const disabled = useMemo(() => {
    if (selectedWebItem) return false;
    return true;
  }, [selectedWebItem]);

  return (
    <Fragment>
      <FormControl fullWidth size="small">
        <Label>ファイルタイプを選択</Label>
        <WebFileTypeSelect fileType={fileType} onFileTypeSelect={handleFileTypeSelect} />
      </FormControl>
      <FormControl fullWidth size="small">
        <Label>データのURLを入力</Label>
        <UrlWrapper>
          <StyledInput
            placeholder="URLを入力してください"
            value={dataUrl}
            onChange={e => handleSetUrl(e.target.value)}
          />
          <BrowseButton size="medium" disabled={!dataUrl} onClick={handleClick}>
            データの閲覧
          </BrowseButton>
        </UrlWrapper>
        <Typography id="modal-modal-description" sx={{ mt: 2, mb: 1 }}>
          {dataUrl && selectedWebItem && selectedWebItem?.description}
        </Typography>
      </FormControl>
      <StyledButton
        startIcon={<AddIcon />}
        disabled={disabled}
        type="submit"
        onClick={handleSubmit}>
        シーンに追加
      </StyledButton>
    </Fragment>
  );
};

const UrlWrapper = styled("section")(({ theme }) => ({
  display: "flex",
  marginBottom: theme.spacing(1),
}));

const StyledInput = styled(Input)(
  () => `
      .${inputClasses.input} {
        font-size: 0.875rem;
        font-weight: 400;
        line-height: 1.5;
        padding: 6px 12px;
        border-radius: 4px 0 0 4px ; 
        border: solid 2px #eee;
        outline: none;
        width: 370px;
      }
    `,
);

const BrowseButton = styled(Button)(({ theme, disabled }) => ({
  color: theme.palette.text.primary,
  backgroundColor: disabled ? theme.palette.grey[50] : theme.palette.primary.main,
  borderRadius: "0 4px 4px 0",
  padding: "0 16px",
  "&:hover": {
    backgroundColor: !disabled && theme.palette.primary.main,
  },
}));

export default WebDataTab;
