import { prefectures } from "@web/extensions/sidebar/core/dataTypes";
import { CatalogRawItem, CatalogItem } from "@web/extensions/sidebar/core/processCatalog";
import { Input, Tabs } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { useCallback, useEffect, useMemo, useState } from "react";

import { FilterType } from "..";
import Tags, { Tag as TagType } from "../Tags";

import FileTree, { DataCatalog } from "./FileTree";

export type Tag = TagType;

export type Props = {
  addedDatasetIds?: string[];
  selectedDataset?: CatalogItem;
  isMobile?: boolean;
  rawCatalog?: CatalogRawItem[];
  selectedTags?: Tag[];
  filter: FilterType;
  onFilter: (filter: FilterType) => void;
  onTagSelect?: (tag: Tag) => void;
  onDatasetAdd: (dataset: CatalogItem) => void;
  onOpenDetails?: (data?: CatalogItem) => void;
};

function typeFilter(catalog: CatalogRawItem[]): DataCatalog {
  const filteredCatalog: CatalogItem[] = prefectures.map(p => {
    const items: CatalogItem[] = catalog.filter(i => {
      if (i.prefecture === p) {
        return {
          type: "item",
          ...i,
        };
      }
    }) as CatalogItem[];

    return {
      type: "group",
      name: p,
      children: items,
    };
  });
  return filteredCatalog;
}

function tagFilter(catalog: CatalogRawItem[], tags?: Tag[]): DataCatalog {
  return catalog
    .filter(item =>
      tags?.every(selectedTag => item.tags?.some(tag => selectedTag.name === tag.name)),
    )
    .map(item => ({ type: "item", ...item } as CatalogItem));
}

function prefectureFilter(catalog: CatalogRawItem[]): DataCatalog {
  return prefectures
    .map(p => {
      const usecase: CatalogItem = {
        type: "group",
        name: "ユースケース",
        children: [],
      };

      const items: CatalogItem[] = catalog
        .filter(i => i.prefecture === p)
        .map(i => {
          if (i.modelType === "usecase") {
            usecase.children.push({
              type: "item",
              ...i,
            } as CatalogItem);
            return;
          }
          return {
            type: "item",
            ...i,
          };
        })
        .filter(i => !!i) as CatalogItem[];

      if (usecase.children.length > 0) {
        items.push(usecase);
      }

      if (items.length < 1) return;

      return {
        type: "group",
        name: p,
        children: items,
      };
    })
    .filter(c => !!(c && c.children.length > 0)) as DataCatalog;
}

function searchCatalog(catalog: CatalogRawItem[], searchTerm = ""): DataCatalog {
  const rawData = catalog.filter(
    item =>
      item.name?.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()) ||
      item.cityName?.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()),
  );
  // selected filter might has to be applied instead
  return prefectureFilter(rawData);
}

function filterCatalog(
  rawCatalog: CatalogRawItem[],
  filter: FilterType,
  payload?: { tags?: Tag[] },
): CatalogItem[] | undefined {
  if (filter === "fileType") {
    return typeFilter(rawCatalog);
  } else if (filter === "tag") {
    return tagFilter(rawCatalog, payload?.tags);
  } else {
    return prefectureFilter(rawCatalog);
  }
}

const DatasetTree: React.FC<Props> = ({
  addedDatasetIds,
  isMobile,
  rawCatalog,
  selectedTags,
  filter,
  onFilter,
  onTagSelect,
  onDatasetAdd,
  onOpenDetails,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [catalog, setCatalog] = useState<DataCatalog>();
  const [loading, _toggleLoading] = useState(false); // needs implementation
  const [expandAll, toggleExpandAll] = useState(false);

  const handleChange = useCallback(({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(value);
  }, []);

  useEffect(() => {
    if (rawCatalog && rawCatalog.length > 0) {
      let filteredCatalog: CatalogItem[] | undefined;
      if (searchTerm.length > 0) {
        filteredCatalog = searchCatalog(rawCatalog, searchTerm);
        toggleExpandAll(true);
      } else {
        filteredCatalog = filterCatalog(rawCatalog, filter, { tags: selectedTags });
        toggleExpandAll(false);
      }
      setCatalog(filteredCatalog);
    }
  }, [rawCatalog, filter, searchTerm, selectedTags]);

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
        onChange={active => onFilter(active as FilterType)}>
        <Tabs.TabPane key="prefecture" tab="都道府県">
          {catalog && (
            <FileTree
              addedDatasetIds={addedDatasetIds}
              catalog={catalog}
              isMobile={isMobile}
              expandAll={expandAll}
              onDatasetAdd={onDatasetAdd}
              onOpenDetails={onOpenDetails}
            />
          )}
        </Tabs.TabPane>
        <Tabs.TabPane key="type" tab="種類">
          {catalog && (
            <FileTree
              addedDatasetIds={addedDatasetIds}
              catalog={catalog}
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
