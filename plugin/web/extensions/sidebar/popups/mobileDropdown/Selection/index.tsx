import SelectionComponent from "@web/extensions/sidebar/core/components/content/Selection";
import { Data } from "@web/extensions/sidebar/core/newTypes";
import { postMsg } from "@web/extensions/sidebar/utils";
import { styled } from "@web/theme";
import { useEffect } from "react";

import PopupItem from "../sharedComponents/PopupItem";

type Props = {
  selectedDatasets: Data[];
  onDatasetRemove: (id: string) => void;
  onDatasetRemoveAll: () => void;
};

const Selection: React.FC<Props> = ({ selectedDatasets, onDatasetRemove, onDatasetRemoveAll }) => {
  useEffect(() => {
    postMsg({ action: "extendPopup" });
  }, []);

  return (
    <Wrapper id="detail">
      <PopupItem>
        <Title>Data Style Settings</Title>
      </PopupItem>
      <SelectionComponent
        selectedDatasets={selectedDatasets}
        onDatasetRemove={onDatasetRemove}
        onDatasetRemoveAll={onDatasetRemoveAll}
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
