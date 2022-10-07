import { Input, Row, Icon } from "@web/extensions/sharedComponents";
import CommonPage from "@web/extensions/sidebar/components/content/CommonPage";
import { styled } from "@web/theme";
import { memo, useCallback, useEffect, useState } from "react";

const Share: React.FC = () => {
  const [publicUrl, setPublicUrl] = useState<string>();

  // TO DO: handle url generation. BELOW IS TEMPORARY... PROBABLY
  function makeUrlSuffix() {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < 15; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    console.log(result, "result");
    return result;
  }

  const handleUrlGeneration = useCallback(() => {
    console.log("hey");
    const suffix = makeUrlSuffix();
    setPublicUrl(`https://plateauview.mlit.go.jp/${suffix}`);
  }, []);

  useEffect(() => {
    handleUrlGeneration();
  }, [handleUrlGeneration]);
  // TO DO: handle url generation. ABOVE IS TEMPORARY... PROBABLY

  // TO DO: handle screenshot (download/show print view) functionality
  // NEEDS API

  return (
    <CommonPage title="共有・印刷">
      <>
        <Subtitle>URLで共有</Subtitle>
        <InputGroup>
          <FlexWrapper>
            <Input value={publicUrl} />
            <StyledButton>
              <Icon icon="copy" />
            </StyledButton>
          </FlexWrapper>
          <SubText>このURLを使えば誰でもこのマップにアクセスできます。</SubText>
        </InputGroup>
        <Subtitle>HTMLページへの埋め込みは下記のコードをお使いください：</Subtitle>
        <InputGroup>
          <FlexWrapper>
            <Input value={`<iframe src=${publicUrl} />`} />
            <StyledButton>
              <Icon icon="copy" />
            </StyledButton>
          </FlexWrapper>
          <SubText>このURLを使えば誰でもこのマップにアクセスできます。</SubText>
        </InputGroup>
      </>
      <>
        <Subtitle>印刷</Subtitle>
        <SectionWrapper>
          <ButtonWrapper>
            <Button onClick={() => {}}>Download map (png)</Button>
            <Button onClick={() => {}}>Show Print View</Button>
          </ButtonWrapper>
          <SubText>このマップを印刷できる状態で表示</SubText>
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
  margin-bottom: 15px;
`;

const SubText = styled.p`
  font-size: 12px;
  color: #b1b1b1;
  margin: 8px 0 16px;
`;

const SectionWrapper = styled(Row)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const InputGroup = styled(Input.Group)`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  flex-wrap: wrap;
  width: 100%;
`;

const FlexWrapper = styled.div`
  display: flex;
  width: 100%;
`;

const ButtonWrapper = styled(FlexWrapper)`
  gap: 8px;
`;

const Button = styled.button`
  height: 37px;
  width: 160px;
  border: none;
  border-radius: 3px;
  background: #ffffff;
  font-size: 14px;
  line-height: 21px;
  cursor: pointer;
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
