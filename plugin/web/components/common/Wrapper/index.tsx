import { Button } from "antd";
import { ReactNode } from "react";

import { styled } from "../../../theme";

// EXAMPLE. YOU CAN DELETE THIS IF YOU WANT
// EXAMPLE. YOU CAN DELETE THIS IF YOU WANT
// EXAMPLE. YOU CAN DELETE THIS IF YOU WANT
// EXAMPLE. YOU CAN DELETE THIS IF YOU WANT
// EXAMPLE. YOU CAN DELETE THIS IF YOU WANT

const Wrapper: React.FC<{ children?: ReactNode }> = ({ children }) => {
  return (
    <StyledWrapper>
      <h1>PLATEAU</h1>
      <StyledContents>
        <StyledButton>alsjlkdf</StyledButton>
        <Button type="dashed" style={{ background: "red" }}>
          Dashed
        </Button>
        {children}
      </StyledContents>
    </StyledWrapper>
  );
};

export default Wrapper;

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background: #dcdcdc;
  border: 2px solid red;
  padding: 10px;
  height: 100%;
  width: 100%;
`;

const StyledContents = styled.div`
  display: flex;
  flex-wrap: wrap;
  border: 1px solid black;
`;

const StyledButton = styled(Button)`
  background-color: green;
  color: white;
  margin: 10px 10px 10px 0;

  :hover {
    background-color: white;
  }
`;
