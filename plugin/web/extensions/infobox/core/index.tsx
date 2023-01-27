import { Collapse, Icon } from "@web/sharedComponents";
import { styled } from "@web/theme";

import Editor from "./components/editor";
import Viewer from "./components/viewer";
import useHooks from "./hooks";

const Infobox: React.FC = () => {
  const { mode, primitives, publicSettings, savePublicSetting } = useHooks();

  return (
    <Wrapper>
      {mode === "edit" && (
        <StyledCollapse
          bordered={false}
          collapsible={"header"}
          defaultActiveKey={publicSettings?.map(publicSetting => publicSetting.type)}
          expandIconPosition="end"
          expandIcon={({ isActive }: { isActive?: boolean }) => (
            <IconWrapper active={!!isActive}>
              <Icon icon="arrowDown" color="#000000" size={18} />
            </IconWrapper>
          )}>
          {publicSettings?.map(publicSetting => (
            <Editor
              key={publicSetting.type}
              publicSetting={publicSetting}
              primitives={primitives}
              savePublicSetting={savePublicSetting}
            />
          ))}
        </StyledCollapse>
      )}
      {mode === "view" && (
        <StyledCollapse
          bordered={false}
          defaultActiveKey={primitives?.map((primitive, index) => index)}
          expandIconPosition="end"
          expandIcon={({ isActive }: { isActive?: boolean }) => (
            <IconWrapper active={!!isActive}>
              <Icon icon="arrowDown" color="#000000" size={18} />
            </IconWrapper>
          )}>
          {primitives?.map((primitive, index) => (
            <Viewer primitive={primitive} publicSettings={publicSettings} key={index} />
          ))}
        </StyledCollapse>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 0 12px;
`;

const StyledCollapse = styled(Collapse)`
  background: none;

  .ant-collapse-header {
    font-size: 16px;
    color: #000;
    background: #fff;
    padding: 12px 40px 12px 12px;
    align-items: center !important;
  }
  .ant-collapse-content-box {
    border-top: 1px solid #e0e0e0;
    padding: 12px !important;
  }
  .ant-collapse-item {
    border-bottom: none;
  }
`;

const IconWrapper = styled.div<{ active: boolean }>`
  width: 20px;
  height: 20px;
  cursor: pointer;

  svg {
    transition: all 0.25s ease;
    transform: ${({ active }) => (active ? "rotate(0)" : "rotate(90deg)")};
  }
`;

export default Infobox;
