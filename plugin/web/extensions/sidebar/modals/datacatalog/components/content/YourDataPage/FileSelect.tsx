import { Tabs, Select, Icon } from "@web/sharedComponents";
import Upload, { message, UploadProps } from "@web/sharedComponents/Upload";
import { styled } from "@web/theme";

const FileSelectPane: React.FC = () => {
  const { Dragger } = Upload;

  const props: UploadProps = {
    name: "file",
    multiple: true,
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    listType: "picture",
    onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (status === "done") {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  return (
    <Wrapper>
      <Tabs defaultActiveKey="local" style={{ marginBottom: "12px" }}>
        <Tabs.TabPane tab="Add Local Data" key="local">
          <Subtitle>Select file type</Subtitle>
          <Select
            defaultValue="auto"
            style={{ width: "100%" }}
            // onChange={handleChange}
            options={[
              {
                value: "auto",
                label: "Auto-detect (Recommended)",
              },
              {
                value: "lucy",
                label: "Lucy",
              },
              {
                value: "disabled",
                disabled: true,
                label: "Disabled",
              },
              {
                value: "Yiminghe",
                label: "yiminghe",
              },
            ]}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Add Web Data" key="web">
          Add Web Data
        </Tabs.TabPane>
      </Tabs>
      <Subtitle>Upload file</Subtitle>
      <UploadWrapper>
        <Dragger {...props}>
          <StyledIcon className="ant-upload-drag-icon" icon="inbox" />
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">
            Support for a single or bulk upload. Strictly prohibit from uploading company data or
            other band files
          </p>
        </Dragger>
      </UploadWrapper>
    </Wrapper>
  );
};

export default FileSelectPane;

const Wrapper = styled.div`
  padding: 24px 12px;
`;

const StyledIcon = styled(Icon)`
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  margin: 0;
`;

const UploadWrapper = styled.div`
  height: 172px;

  .ant-upload-list-item {
    height: 50px;
  }
`;
