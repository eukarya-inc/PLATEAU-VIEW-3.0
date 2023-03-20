import { DataCatalogItem, DataCatalogGroup } from "@web/extensions/sidebar/core/types";
import { styled } from "@web/theme";
import { useCallback, useState } from "react";

import TreeBuilder from "./TreeBuilder";

export type Props = {
  addedDatasetDataIDs?: string[];
  catalog: (DataCatalogItem | DataCatalogGroup)[];
  isMobile?: boolean;
  expandAll?: boolean;
  addDisabled: (dataID: string) => boolean;
  onDatasetAdd: (dataset: DataCatalogItem, keepModalOpen?: boolean) => void;
  onOpenDetails?: (data?: DataCatalogItem) => void;
};

const FileTree: React.FC<Props> = ({
  addedDatasetDataIDs,
  catalog,
  isMobile,
  expandAll,
  addDisabled,
  onDatasetAdd,
  onOpenDetails,
}) => {
  const [selectedID, select] = useState<string>();
  const [expandedFolders, setExpandedFolders] = useState<{ id?: string; name?: string }[]>([]);

  const handleSelect = useCallback((dataID?: string) => {
    select(dataID);
  }, []);

  return (
    <TreeWrapper isMobile={isMobile}>
      <Tree>
        <TreeBuilder
          catalogItem={catalog}
          addedDatasetDataIDs={addedDatasetDataIDs}
          isMobile={isMobile}
          expandAll={expandAll}
          selectedID={selectedID}
          nestLevel={0}
          expandedFolders={expandedFolders}
          addDisabled={addDisabled}
          onDatasetAdd={onDatasetAdd}
          onOpenDetails={onOpenDetails}
          onSelect={handleSelect}
          setExpandedFolders={setExpandedFolders}
        />
      </Tree>
    </TreeWrapper>
  );
};

export default FileTree;

const TreeWrapper = styled.div<{ isMobile?: boolean }>`
  width: ${({ isMobile }) => (isMobile ? "100%" : "298px")};
  height: ${({ isMobile }) => (isMobile ? "100%" : "400px")};
  overflow-y: scroll;
`;

const Tree = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
`;
