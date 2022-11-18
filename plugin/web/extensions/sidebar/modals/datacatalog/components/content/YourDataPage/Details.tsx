import DetailsComponent from "@web/extensions/sidebar/modals/datacatalog/components/content/DatasetDetails";
import { Data as DataType } from "@web/extensions/sidebar/modals/datacatalog/types";
import { styled } from "@web/theme";
import { useCallback } from "react";

export type Data = DataType;

export type Props = {
  dataset?: Data;
  onDatasetAdd: (dataset: Data) => void;
};

const DatasetDetails: React.FC<Props> = ({ dataset, onDatasetAdd }) => {
  const handleDatasetAdd = useCallback(() => {
    if (!dataset) return;
    onDatasetAdd(dataset);
  }, [dataset, onDatasetAdd]);

  const ContentComponent: React.FC = () => (
    <>
      <TagWrapper>
        {dataset?.type !== "group" &&
          dataset?.tags?.map(tag => (
            <Tag key={tag.name} type={tag.type}>
              {tag.name}
            </Tag>
          ))}
      </TagWrapper>
      {dataset && dataset?.type !== "group" && (
        <Content
          dangerouslySetInnerHTML={{
            __html: dataset.description as string,
          }}
        />
      )}
    </>
  );

  return dataset ? (
    <DetailsComponent
      dataset={dataset}
      onDatasetAdd={handleDatasetAdd}
      contentSection={ContentComponent}
    />
  ) : (
    <NoData>
      <NoDataMain>
        <StyledP>データセットがありません</StyledP>
      </NoDataMain>
    </NoData>
  );
};

export default DatasetDetails;

const NoData = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: rgba(0, 0, 0, 0.25);
  height: calc(100% - 24px);
  margin-bottom: 24px;
`;

const NoDataMain = styled.div`
  display: flex;
  justify-content: center;
  flex: 1;
  flex-direction: column;
`;

const StyledP = styled.p`
  margin: 0;
  text-align: center;
`;

const TagWrapper = styled.div`
  display: flex;
  gap: 12px;
`;

const Tag = styled.p<{ type?: "location" | "data-type" }>`
  line-height: 16px;
  height: 32px;
  padding: 8px 12px;
  margin: 0;
  background: #ffffff;
  border-left: 2px solid ${({ type }) => (type === "location" ? "#03c3ff" : "#1ED500")};
`;

const Content = styled.div`
  margin-top: 16px;
`;
