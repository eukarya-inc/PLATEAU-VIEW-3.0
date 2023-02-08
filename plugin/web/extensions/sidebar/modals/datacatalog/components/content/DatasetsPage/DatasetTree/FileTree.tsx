import {
  CatalogItem,
  DataCatalog as DataCatalogType,
} from "@web/extensions/sidebar/core/processCatalog";
import { styled } from "@web/theme";
import { useCallback, useState } from "react";

import TreeBuilder from "./TreeBuilder";

export type DataCatalog = DataCatalogType;

export type Props = {
  addedDatasetIds?: string[];
  catalog: DataCatalog;
  isMobile?: boolean;
  onDatasetAdd: (dataset: CatalogItem) => void;
  onOpenDetails?: (data?: CatalogItem) => void;
};

const FileTree: React.FC<Props> = ({
  addedDatasetIds,
  catalog,
  isMobile,
  onDatasetAdd,
  onOpenDetails,
}) => {
  const [selectedId, select] = useState<string>();

  const handleSelect = useCallback((id?: string) => {
    select(id);
  }, []);

  return (
    <TreeWrapper isMobile={isMobile}>
      <Tree>
        {catalog.map(item =>
          TreeBuilder({
            item,
            addedDatasetIds,
            selectedId,
            nestLevel: 1,
            onDatasetAdd,
            onOpenDetails,
            onSelect: handleSelect,
          }),
        )}
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
