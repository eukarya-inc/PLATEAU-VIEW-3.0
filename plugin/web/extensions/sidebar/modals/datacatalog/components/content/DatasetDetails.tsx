import { CatalogItem } from "@web/extensions/sidebar/core/processCatalog";
import { Icon } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { ComponentType, useCallback } from "react";

export type Props = {
  dataset: CatalogItem;
  addDisabled: boolean;
  contentSection?: ComponentType;
  onDatasetAdd: (dataset: CatalogItem) => void;
};

const DatasetDetails: React.FC<Props> = ({
  dataset,
  addDisabled,
  contentSection: ContentSection,
  onDatasetAdd,
}) => {
  const handleDatasetAdd = useCallback(() => {
    if (!dataset) return;
    onDatasetAdd(dataset);
  }, [dataset, onDatasetAdd]);

  return (
    <Wrapper>
      <Title>{dataset.type === "item" && (dataset.cityName ?? dataset.name)}</Title>
      <ButtonWrapper>
        <Button disabled={addDisabled} onClick={handleDatasetAdd}>
          {!addDisabled && <Icon icon="plusCircle" />}
          {addDisabled ? "シーンに追加済み" : "シーンに追加"}
        </Button>
        <Button>
          <Icon icon="share" />
          シェア
        </Button>
      </ButtonWrapper>
      {ContentSection && <ContentSection />}
    </Wrapper>
  );
};

export default DatasetDetails;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin: 12px 0 16px 0;
`;

const Button = styled.button<{ disabled?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex: 1;
  height: 40px;
  color: ${({ disabled }) => (disabled ? "grey" : "#00bebe")};
  font-weight: 500;
  background: ${({ disabled }) => (disabled ? "#dcdcdc" : "#ffffff")};
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  ${({ disabled }) => !disabled && "cursor: pointer;"}
`;

const Title = styled.p`
  font-size: 16px;
  font-weight: 700;
  line-height: 22px;
`;
