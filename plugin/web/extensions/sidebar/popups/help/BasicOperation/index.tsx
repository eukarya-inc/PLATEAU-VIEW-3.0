import basicOperation from "@web/extensions/sidebar/core/assets/basicOperation.png";
import { styled } from "@web/theme";

const BasicOperation: React.FC = () => {
  return (
    <Wrapper>
      <img src={basicOperation} />
    </Wrapper>
  );
};

export default BasicOperation;

const Wrapper = styled.div`
  width: 318px;
  height: 457px;
  padding: 16px;
`;
