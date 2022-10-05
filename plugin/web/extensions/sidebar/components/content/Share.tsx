import { Input, Radio, Row, Icon } from "@web/extensions/sharedComponents";
import CommonPage from "@web/extensions/sidebar/components/content/CommonPage";
import { styled } from "@web/theme";
import { memo } from "react";

const PrintMapData = ["Download map (png)", "Show Print View"];

const Share: React.FC = () => {
  return (
    <CommonPage title="Share/Print">
      <>
        <Subtitle>Share URL</Subtitle>
        <InputGroup>
          <div style={{ display: "flex", width: "100%" }}>
            <Input defaultValue="Anyone with this URL will be able to access this map." />
            <StyledButton>
              <Icon icon="copy" />
            </StyledButton>
          </div>
          <SubText>Anyone with this URL will be able to access this map.</SubText>
        </InputGroup>
      </>
      <>
        <Subtitle>Print Map</Subtitle>
        <SectionWrapper>
          <RadioGroup defaultValue="3D Terrain" buttonStyle="solid">
            {PrintMapData.map(item => (
              <RadioButton key={item} value={item}>
                <Text>{item}</Text>
              </RadioButton>
            ))}
          </RadioGroup>
          <SubText>Open a printable version of this map.</SubText>
        </SectionWrapper>
      </>
    </CommonPage>
  );
};
export default memo(Share);

const Text = styled.p`
  font-size: 14px;
  margin: 0;
`;

const Subtitle = styled(Text)`
  margin-bottom: 24px;
`;

const SubText = styled.p`
  font-size: 10px;
  color: #b1b1b1;
  margin-top: 8px;
`;

const SectionWrapper = styled(Row)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
`;

const InputGroup = styled(Input.Group)`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  flex-wrap: wrap;
  padding: 0px;
`;

const RadioGroup = styled(Radio.Group)`
  display: flex;
  gap: 8px;
`;

const RadioButton = styled(Radio.Button)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
`;

const StyledButton = styled.button`
  background: #00bebe;
  border: none;
  border-radius: 2px;
  width: 40px;
  cursor: pointer;

  :hover {
    background: #00bebe;
    border-color: #00bebe;
    color: white;
  }
`;
