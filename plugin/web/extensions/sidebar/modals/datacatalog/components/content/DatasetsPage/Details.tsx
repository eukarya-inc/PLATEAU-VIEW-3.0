import { DataCatalogItem } from "@web/extensions/sidebar/core/types";
import DetailsComponent from "@web/extensions/sidebar/modals/datacatalog/components/content/DatasetDetails";
import { Icon } from "@web/sharedComponents";
import { styled } from "@web/theme";

import { UserDataItem } from "../../../types";

import { Tag as TagType } from "./Tags";
// import Tags, {Tag as TagType} from "./Tags";

export type Tag = TagType;

export type Props = {
  dataset?: DataCatalogItem;
  isMobile?: boolean;
  inEditor?: boolean;
  addDisabled: (dataID: string) => boolean;
  onTagSelect?: (tag: TagType) => void;
  onDatasetAdd: (dataset: DataCatalogItem | UserDataItem, keepModalOpen?: boolean) => void;
  onDatasetPublish?: (dataID: string, publish: boolean) => void;
};

const DatasetDetails: React.FC<Props> = ({
  dataset,
  // isMobile,
  inEditor,
  addDisabled,
  // onTagSelect,
  onDatasetAdd,
  onDatasetPublish,
}) => {
  // const datasetTags = useMemo(
  //   () => (dataset?.type !== "group" ? dataset?.tags?.map(tag => tag) : undefined),
  //   [dataset],
  // );

  const ContentComponent: React.FC = () => (
    <>
      {/* {!isMobile && <Tags tags={datasetTags} onTagSelect={onTagSelect} />} */}
      {dataset && dataset?.type !== "group" && (
        <Content
          dangerouslySetInnerHTML={{
            __html: dataset.desc?.replace(
              /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9(@:%_+.~#?&//=]*)/g,
              url => {
                return `<a href="javascript:window.open('${url}','_blank')">${url} <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M3.33331 4.66659C3.1565 4.66659 2.98693 4.73682 2.86191 4.86185C2.73688 4.98687 2.66665 5.15644 2.66665 5.33325V12.6666C2.66665 12.8434 2.73688 13.013 2.86191 13.138C2.98693 13.263 3.1565 13.3333 3.33331 13.3333H10.6666C10.8435 13.3333 11.013 13.263 11.1381 13.138C11.2631 13.013 11.3333 12.8434 11.3333 12.6666V8.66659C11.3333 8.2984 11.6318 7.99992 12 7.99992C12.3682 7.99992 12.6666 8.2984 12.6666 8.66659V12.6666C12.6666 13.197 12.4559 13.7057 12.0809 14.0808C11.7058 14.4559 11.1971 14.6666 10.6666 14.6666H3.33331C2.80288 14.6666 2.29417 14.4559 1.9191 14.0808C1.54403 13.7057 1.33331 13.197 1.33331 12.6666V5.33325C1.33331 4.80282 1.54403 4.29411 1.9191 3.91904C2.29417 3.54397 2.80288 3.33325 3.33331 3.33325H7.33331C7.7015 3.33325 7.99998 3.63173 7.99998 3.99992C7.99998 4.36811 7.7015 4.66659 7.33331 4.66659H3.33331Z" fill="#00BEBE"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M9.33331 1.99992C9.33331 1.63173 9.63179 1.33325 9.99998 1.33325H14C14.3682 1.33325 14.6666 1.63173 14.6666 1.99992V5.99992C14.6666 6.36811 14.3682 6.66658 14 6.66658C13.6318 6.66658 13.3333 6.36811 13.3333 5.99992V2.66659H9.99998C9.63179 2.66659 9.33331 2.36811 9.33331 1.99992Z" fill="#00BEBE"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.4714 1.52851C14.7318 1.78886 14.7318 2.21097 14.4714 2.47132L7.13807 9.80466C6.87772 10.065 6.45561 10.065 6.19526 9.80466C5.93491 9.54431 5.93491 9.1222 6.19526 8.86185L13.5286 1.52851C13.7889 1.26816 14.2111 1.26816 14.4714 1.52851Z" fill="#00BEBE"/>
</svg></a>`;
              },
            ),
          }}
        />
      )}
    </>
  );

  return dataset ? (
    <DetailsComponent
      dataset={dataset}
      addDisabled={addDisabled(dataset.dataID)}
      inEditor={inEditor}
      isPublishable={!!dataset.itemId}
      contentSection={ContentComponent}
      onDatasetAdd={onDatasetAdd}
      onDatasetPublish={onDatasetPublish}
    />
  ) : (
    <NoData>
      <NoDataMain>
        <Icon icon="empty" size={64} />
        <StyledP>データがない</StyledP>
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
  white-space: pre-wrap;

  a {
    display: inline-flex;
    align-items: center;
    color: #00bebe;
  }
`;
