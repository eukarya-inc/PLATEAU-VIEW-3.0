import { Input, Tabs } from "@web/sharedComponents";
import { styled } from "@web/theme";
// import { useCallback, useEffect, useState } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { DataCatalogItem, getDataCatalogTree, GroupBy } from "../../../../api/api";
import Tags, { Tag as TagType } from "../Tags";

import FileTree from "./FileTree";

export type Tag = TagType;

export type Props = {
  addedDatasetIds?: string[];
  selectedDataset?: DataCatalogItem;
  isMobile?: boolean;
  catalog?: DataCatalogItem[];
  selectedTags?: Tag[];
  filter: GroupBy;
  onFilter: (filter: GroupBy) => void;
  onTagSelect?: (tag: Tag) => void;
  onDatasetAdd: (dataset: DataCatalogItem) => void;
  onOpenDetails?: (data?: DataCatalogItem) => void;
};

// function typeFilter(catalog: Catalog): DataCatalog {
//   const filteredCatalog: CatalogItem[] = prefectures.map(p => {
//     const items: CatalogItem[] = catalog.filter(i => {
//       if (i.prefecture === p) {
//         return {
//           type: "item",
//           ...i,
//         };
//       }
//     }) as CatalogItem[];

//     return {
//       type: "group",
//       name: p,
//       children: items,
//     };
//   });
//   return filteredCatalog;
// }

// function tagFilter(catalog: CatalogRawItem[], tags?: Tag[]): DataCatalog {
//   return catalog
//     .filter(item =>
//       tags?.every(selectedTag => item.tags?.some(tag => selectedTag.name === tag.name)),
//     )
//     .map(item => ({ type: "item", ...item } as CatalogItem));
// }

const DatasetTree: React.FC<Props> = ({
  addedDatasetIds,
  isMobile,
  catalog,
  selectedTags,
  filter,
  onFilter,
  onTagSelect,
  onDatasetAdd,
  onOpenDetails,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, _toggleLoading] = useState(false); // needs implementation
  const [expandAll, toggleExpandAll] = useState(false);

  const handleChange = useCallback(({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(value);
  }, []);

  useEffect(() => {
    if (searchTerm.length > 0) {
      toggleExpandAll(true);
    } else {
      toggleExpandAll(false);
    }
  }, [searchTerm]);

  const dataCatalogTree = useMemo(
    () =>
      catalog &&
      getDataCatalogTree(catalog, filter, searchTerm.length > 0 ? searchTerm : undefined),
    [catalog, filter, searchTerm],
  );

  const showInput = useMemo(
    () => !selectedTags?.length || searchTerm.length > 0,
    [searchTerm.length, selectedTags?.length],
  );

  const showTags = useMemo(
    () => selectedTags && selectedTags.length > 0 && searchTerm.length === 0,
    [searchTerm.length, selectedTags],
  );

  const showTabs = useMemo(
    () => searchTerm.length > 0 || selectedTags?.length,
    [searchTerm.length, selectedTags],
  );

  return (
    <Wrapper isMobile={isMobile}>
      {showInput && (
        <StyledInput
          placeholder="検索"
          value={searchTerm}
          onChange={handleChange}
          loading={loading}
        />
      )}
      {showTags && <Tags tags={selectedTags} onTagSelect={onTagSelect} />}
      {searchTerm.length > 0 && <p style={{ margin: "0", alignSelf: "center" }}>検索結果</p>}
      <StyledTabs
        defaultActiveKey="prefecture"
        tabBarStyle={showTabs ? { display: "none" } : { userSelect: "none" }}
        onChange={active => onFilter(active as GroupBy)}>
        <Tabs.TabPane key="prefecture" tab="都道府県">
          {dataCatalogTree && (
            <FileTree
              addedDatasetIds={addedDatasetIds}
              catalog={dataCatalogTree}
              isMobile={isMobile}
              expandAll={expandAll}
              onDatasetAdd={onDatasetAdd}
              onOpenDetails={onOpenDetails}
            />
          )}
        </Tabs.TabPane>
        <Tabs.TabPane key="type" tab="種類">
          {dataCatalogTree && (
            <FileTree
              addedDatasetIds={addedDatasetIds}
              catalog={dataCatalogTree}
              isMobile={isMobile}
              expandAll={expandAll}
              onDatasetAdd={onDatasetAdd}
              onOpenDetails={onOpenDetails}
            />
          )}
        </Tabs.TabPane>
      </StyledTabs>
    </Wrapper>
  );
};

export default DatasetTree;

const Wrapper = styled.div<{ isMobile?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: ${({ isMobile }) => (isMobile ? "24px 12px" : "24px 0 24px 12px")};
  width: ${({ isMobile }) => (isMobile ? "100%" : "310px")};
`;

const StyledInput = styled(Input.Search)`
  .ant-input {
    :hover {
      border: 1px solid #00bebe;
    }
  }
  .ant-input-group-addon {
    width: 32px;
    padding: 0;
    :hover {
      cursor: pointer;
    }
  }
`;

const StyledTabs = styled(Tabs)`
  .ant-tabs-nav {
    border-bottom: 0.5px solid #c7c5c5;
    padding: 0 10px;
  }
  .ant-tabs-tab:hover {
    color: #00bebe;
  }
  .ant-tabs-ink-bar {
    background: #00bebe;
  }
  .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
    color: #00bebe;
  }
`;
