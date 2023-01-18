import { prefectures } from "@web/extensions/sidebar/core/dataTypes";
import { CatalogRawItem, CatalogItem } from "@web/extensions/sidebar/core/processCatalog";
import { Icon, Input, Tabs } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { useCallback, useEffect, useState } from "react";

import Tags, { Tag } from "../Tags";

import FileTree, { DataCatalog } from "./FileTree";

type FilterType = "prefecture" | "fileType" | "tag";

export type Props = {
  rawCatalog?: CatalogRawItem[];
  selectedTags?: Tag[];
  onTagSelect: (tag: Tag) => void;
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

function tagFilter(catalog: CatalogRawItem[]): DataCatalog {
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

function filterCatalog(
  rawCatalog: CatalogRawItem[],
  filter: FilterType,
): CatalogItem[] | undefined {
  if (filter === "fileType") {
    return typeFilter(rawCatalog);
  } else if (filter === "tag") {
    return tagFilter(rawCatalog);
  } else {
    return prefectureFilter(rawCatalog);
  }
}

const DatasetTree: React.FC<Props> = ({ rawCatalog, selectedTags, onTagSelect, onOpenDetails }) => {
  const [filter, setFilter] = useState<FilterType>("prefecture");
  const [searchTerm, setSearchTerm] = useState("");
  const [catalog, setCatalog] = useState<DataCatalog>();

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.currentTarget.value);
  }, []);

  const handleFilter = useCallback((filter: FilterType) => {
    setFilter(filter);
  }, []);

  useEffect(() => {
    if (rawCatalog && rawCatalog.length > 0) {
      const filteredCatalog = filterCatalog(rawCatalog, filter);
      setCatalog(filteredCatalog);
    }
  }, [rawCatalog, filter]);

  return (
    <Wrapper>
      {!selectedTags?.length && (
        <StyledInput
          placeholder="検索"
          value={searchTerm}
          onChange={handleSearch}
          addonAfter={<StyledIcon icon="search" size={15} />}
        />
      )}
      {selectedTags && selectedTags.length > 0 && (
        <Tags tags={selectedTags} onTagSelect={onTagSelect} />
      )}
      {searchTerm.length > 0 && <p style={{ margin: "0", alignSelf: "center" }}>検索結果</p>}
      <StyledTabs
        defaultActiveKey="prefecture"
        tabBarStyle={
          searchTerm.length > 0 || selectedTags?.length
            ? { display: "none" }
            : {
                userSelect: "none",
              }
        }
        onChange={active => handleFilter(active as FilterType)}>
        <Tabs.TabPane key="prefecture" tab="都道府県">
          {catalog && <FileTree catalog={catalog} onOpenDetails={onOpenDetails} />}
        </Tabs.TabPane>
        <Tabs.TabPane key="type" tab="種類">
          {catalog && <FileTree catalog={catalog} onOpenDetails={onOpenDetails} />}
        </Tabs.TabPane>
      </StyledTabs>
    </Wrapper>
  );
};

export default DatasetTree;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px 0 24px 12px;
  width: 310px;
`;

const StyledInput = styled(Input)`
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

const StyledIcon = styled(Icon)`
  margin: 0 auto;
`;
