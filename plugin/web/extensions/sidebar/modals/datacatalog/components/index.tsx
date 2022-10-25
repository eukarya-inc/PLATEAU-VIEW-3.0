import { styled } from "@web/theme";

const DataCatalog: React.FC = () => {
  return (
    <Wrapper>
      <Title>Datacatalog12</Title>
    </Wrapper>
  );
};

export default DataCatalog;

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 400px;
  height: 400px;
  padding: 4px;
  border: 2px solid red;
  background: yellow;
`;

const Title = styled.h1`
  color: black;
`;
