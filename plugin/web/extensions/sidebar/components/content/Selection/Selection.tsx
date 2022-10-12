import { Icon } from "@web/extensions/sharedComponents";
import Footer from "@web/extensions/sidebar/components/Footer";
import { styled } from "@web/theme";
import { useCallback, useState } from "react";

import DatasetWrapper, { Dataset } from "./DatasetCard";

const Selection: React.FC = () => {
  const [selectedDatasets, updateDatasets] = useState<Dataset[]>([]);

  // This will become open datacatalog and the fieldAdd will move in to its scope
  const handleDatasetAdd = useCallback(() => {
    updateDatasets(oldDatasets => {
      const id = Math.floor(Math.random() * 100);
      return [
        ...oldDatasets,
        {
          id: `dataset-${id}`,
          name: `建物の${id}`,
          hidden: false,
          idealZoom: { lat: 20, lon: 30, height: 100 },
          dataUrl: "www.example.com",
          fields: [],
        },
      ];
    });
  }, []);

  const handleDatasetRemove = useCallback(
    (id: string) => updateDatasets(oldDatasets => oldDatasets.filter(d => d.id !== id)),
    [],
  );

  const handleDatasetRemoveAll = useCallback(() => updateDatasets([]), []);

  // const handleFieldRemove = useCallback((id: string) => {
  //   updateDatasets(oldDatasets => oldDatasets.filter(d => d.id !== id));
  // }, []);

  return (
    <Wrapper>
      <InnerWrapper>
        <StyledButton onClick={handleDatasetAdd}>
          <StyledIcon icon="plusCircle" size={20} />
          <ButtonText>カタログから検索する</ButtonText>
        </StyledButton>
        {selectedDatasets.map(d => (
          <DatasetWrapper key={d.id} dataset={d} onRemove={handleDatasetRemove} />
        ))}
      </InnerWrapper>
      <Footer datasetQuantity={selectedDatasets.length} onRemoveAll={handleDatasetRemoveAll} />
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
  flex: 1;
  overflow: auto;
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
