import DetailsComponent from "@web/extensions/sidebar/modals/datacatalog/components/content/DatasetDetails";
import { Data, Tag as TagType } from "@web/extensions/sidebar/modals/datacatalog/types";
import { Icon } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { useCallback, useMemo } from "react";

import Tags from "./Tags";

export type Tag = TagType;

export type Props = {
  dataset?: Data;
  addDisabled: boolean;
  onTagSelect: (tag: Tag) => void;
  onDatasetAdd: (dataset: Data) => void;
};

const DatasetDetails: React.FC<Props> = ({ dataset, addDisabled, onTagSelect, onDatasetAdd }) => {
  const datasetTags = useMemo(
    () => (dataset?.type !== "group" ? dataset?.tags?.map(tag => tag) : undefined),
    [dataset],
  );

  const handleDatasetAdd = useCallback(() => {
    if (!dataset || addDisabled) return;
    onDatasetAdd(dataset);
  }, [dataset, addDisabled, onDatasetAdd]);

  const ContentComponent: React.FC = () => (
    <>
      <Tags tags={datasetTags} onTagSelect={onTagSelect} />
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
      addDisabled={addDisabled}
      onDatasetAdd={handleDatasetAdd}
      contentSection={ContentComponent}
    />
  ) : (
    <NoData>
      <NoDataMain>
        <Icon icon="empty" size={64} />
        <StyledP>No Data</StyledP>
        <br />
        <StyledP>データセットを選択してください(プレビューが表示されます)</StyledP>
      </NoDataMain>
      <NoDataFooter
        onClick={() =>
          window.open("https://www.geospatial.jp/ckan/dataset/plateau-tokyo23ku", "_blank")
        }>
        <Icon icon="newPage" size={16} />
        <StyledP> オープンデータ・ダウンロード(G空間情報センターへのリンク)</StyledP>
      </NoDataFooter>
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
  align-items: center;
  flex: 1;
  flex-direction: column;
`;

const NoDataFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  color: #00bebe;
  cursor: pointer;
`;

const StyledP = styled.p`
  margin: 0;
  text-align: center;
`;

const Content = styled.div`
  margin-top: 16px;
`;
