import { Icon } from "@web/extensions/sharedComponents";
import Footer from "@web/extensions/sidebar/components/Footer";
import { styled } from "@web/theme";

const Selection: React.FC = () => {
  return (
    <Wrapper>
      <InnerWrapper>
        <StyledButton
          onClick={() => alert("This is an awesome datacatalog modal!! Use me...if you can!")}>
          <StyledIcon icon="plusCircle" size={20} />
          <ButtonText>Explore map data</ButtonText>
        </StyledButton>
      </InnerWrapper>
      <Footer />
    </Wrapper>
  );
};

export default Selection;

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const InnerWrapper = styled.div`
  padding: 16px;
`;

const StyledButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  border: none;
  border-radius: 4px;
  background: #00bebe;
  color: #fff;
  padding: 10px;
  cursor: pointer;
`;

const ButtonText = styled.p`
  margin: 0;
`;

const StyledIcon = styled(Icon)`
  margin-right: 8px;
`;
