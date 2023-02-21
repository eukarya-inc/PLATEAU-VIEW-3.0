import SelectionComponent from "@web/extensions/sidebar/core/components/content/Selection";
import { DataCatalogItem } from "@web/extensions/sidebar/core/types";
import { postMsg } from "@web/extensions/sidebar/utils";
import { styled } from "@web/theme";
import { useEffect } from "react";

import PopupItem from "../sharedComponents/PopupItem";

type Props = {
  selectedDatasets: DataCatalogItem[];
  onDatasetSave: (datasetId: string) => void;
  onDatasetUpdate: (updatedDataset: DataCatalogItem) => void;
  onDatasetRemove: (id: string) => void;
  onDatasetRemoveAll: () => void;
  onThreeDTilesSearch: (id: string) => void;
};

const Selection: React.FC<Props> = ({
  selectedDatasets,
  onDatasetSave,
  onDatasetUpdate,
  onDatasetRemove,
  onDatasetRemoveAll,
  onThreeDTilesSearch,
}) => {
  useEffect(() => {
    postMsg({ action: "extendPopup" });
  }, []);

  return (
    <Wrapper>
      <PopupItem>
        <Title>Data Style Settings</Title>
      </PopupItem>
      <SelectionComponent
        selectedDatasets={selectedDatasets}
        onDatasetSave={onDatasetSave}
        onDatasetUpdate={onDatasetUpdate}
        onDatasetRemove={onDatasetRemove}
        onDatasetRemoveAll={onDatasetRemoveAll}
        onThreeDTilesSearch={onThreeDTilesSearch}
      />
    </Wrapper>
  );
};

export default Selection;

const Wrapper = styled.div`
  border-top: 1px solid #d9d9d9;
  height: calc(100% - 47px);
`;

const Title = styled.p`
  margin: 0;
`;
