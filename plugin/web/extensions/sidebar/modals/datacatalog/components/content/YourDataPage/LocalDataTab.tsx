import { UserDataItem } from "@web/extensions/sidebar/modals/datacatalog/types";
import { getExtension } from "@web/extensions/sidebar/utils/file";
import { Form } from "@web/sharedComponents";
import { InboxOutlined } from "@web/sharedComponents/Icon/icons";
import Upload, { UploadProps, UploadFile } from "@web/sharedComponents/Upload";
import { RcFile } from "antd/lib/upload";
import { useCallback, useMemo, useState } from "react";

import FileTypeSelect, { fileFormats, FileType } from "./FileTypeSelect";

type Props = {
  onOpenDetails?: (data?: UserDataItem) => void;
  setSelectedLocalItem?: (data?: UserDataItem) => void;
};

const LocalDataTab: React.FC<Props> = ({ onOpenDetails, setSelectedLocalItem }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [fileType, setFileType] = useState<FileType>("auto");

  const onRemove = useCallback((_file: UploadFile) => {
    setFileList([]);
  }, []);

  const setDataFormat = useCallback((type: FileType, filename: string) => {
    const extension = getExtension(filename);
    if (type === "auto") {
      // more exceptions will be added in the future
      switch (extension) {
        case "kmz":
          return "kml";
        default:
          return extension;
      }
    }
    return type;
  }, []);

  const beforeUpload = useCallback(
    (file: RcFile, files: RcFile[]) => {
      // Catalog Item
      const filename = file.name;
      const id = "id" + Math.random().toString(16).slice(2);
      const url = URL.createObjectURL(file);
      const item: UserDataItem = {
        type: "item",
        id: id,
        description:
          "This file only exists in your browser. To share it, you must load it onto a public web server.",
        name: filename,
        dataUrl: url,
        dataFormat: setDataFormat(fileType, filename),
      };
      if (onOpenDetails) onOpenDetails(item);
      if (setSelectedLocalItem) setSelectedLocalItem(item);

      // Raw Data
      // const reader = new FileReader();
      // reader.readAsText(file);
      // let data;
      // reader.onload = e => {
      //   data = e?.target?.result;
      // };

      setFileList([...files]);
      return false;
    },
    [fileType, onOpenDetails, setDataFormat, setSelectedLocalItem],
  );

  const props: UploadProps = useMemo(
    () => ({
      name: "file",
      multiple: false,
      directory: false,
      showUploadList: true,
      accept: fileFormats,
      listType: "picture",
      onRemove: onRemove,
      beforeUpload: beforeUpload,
      fileList,
    }),
    [beforeUpload, fileList, onRemove],
  );

  const handleFileTypeSelect = useCallback((type: string) => {
    setFileType(type as FileType);
  }, []);

  return (
    <Form layout="vertical">
      <Form.Item name="file-type" label="Select file type">
        <FileTypeSelect onFileTypeSelect={handleFileTypeSelect} />
      </Form.Item>
      <Form.Item label="Upload File">
        <Form.Item name="upload-file" style={{ height: 300, overflowY: "scroll" }}>
          <Upload.Dragger {...props}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
              Support for a single or bulk upload. Strictly prohibit from uploading company data or
              other band files
            </p>
          </Upload.Dragger>
        </Form.Item>
      </Form.Item>
    </Form>
  );
};

export default LocalDataTab;
