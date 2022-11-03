import { Dataset as DatasetType } from "@web/extensions/sidebar/core/components/content/Selection/DatasetCard/types";
import DetailsComponent from "@web/extensions/sidebar/modals/datacatalog/components/content/DatasetDetails";
import { styled } from "@web/theme";
import { useCallback } from "react";

export type Dataset = DatasetType;

export type Props = {
  dataset?: Dataset;
  onDatasetAdd: (dataset: Dataset) => void;
};

const fakeDataset = (): Dataset => {
  const id = `dataset-${Math.floor(Math.random() * 100)}`;
  return {
    id,
    name: `建物の${id}`,
    hidden: false,
    idealZoom: { lat: 20, lon: 30, height: 100 },
    dataUrl: "www.example.com",
    tags: [
      { type: "location", name: "東京都" },
      { type: "location", name: "東京都23区" },
      { type: "location", name: "千代田区" },
      { type: "data-type", name: "建物モデル" },
    ],
    fields: [],
  };
};

const DatasetDetails: React.FC<Props> = ({ dataset = fakeDataset(), onDatasetAdd }) => {
  // const markerRef = useRef<L.Marker<any>>(null);

  // const handleChange = useCallback(
  //   ({ lat, lng }: { lat: number; lng: number }) => {
  //     if (isBuilt || !isEditable) return;
  //     onChange?.("default", "location", { lat, lng }, "latlng");
  //   },
  //   [isBuilt, isEditable, onChange],
  // );

  // const eventHandlers = useMemo(
  //   () => ({
  //     dragend() {
  //       const marker = markerRef.current;
  //       if (marker) {
  //         handleChange(marker.getLatLng());
  //       }
  //     },
  //   }),
  //   [handleChange],
  // );

  const handleDatasetAdd = useCallback(() => {
    onDatasetAdd(dataset);
  }, [dataset, onDatasetAdd]);

  const ContentComponent: React.FC = () => (
    <>
      <TagWrapper>
        {dataset.tags?.map(tag => (
          <Tag key={tag.name} type={tag.type}>
            {tag.name}
          </Tag>
        ))}
      </TagWrapper>
      <Content>
        <p>Description</p>
        <p>
          土地利用現況・建物現況調査の結果や航空写真等を用いて構築したLOD1及びLOD2の3D都市モデル。
          テクスチャ付きのLOD2モデルは都市再生特別措置法第2条第3項に基づく都市再生緊急整備地域（緊急かつ重点的に市街地の整備を推進すべき地域）を中心に構築。
          都市計画法第6条に基づく都市計画基礎調査等の土地・建物利用情報等を建物の属性情報として付加。
          仕様書等と併せて政府標準利用規約に則ったオープンデータとして公開済み。
        </p>
        <p>〔モデル作成〕 国際航業株式会社 https://www.kkc.co.jp/</p>
        <p>〔モデル編集・変換〕 株式会社三菱総合研究所・Pacific Spatial Solutions株式会社</p>
        <p>
          〔出典〕 建物図形：土地利用現況・建物現況調査（東京都）（2016年・2017年） 計測高さ：LOD1
          航空レーザー測量（国際航業株式会社）（2020年）
        </p>
        <p>SCROLLABLE IF CONTENT LONG1111</p>
        <p>SCROLLABLE IF CONTENT LONG</p>
        <p>SCROLLABLE IF CONTENT LONG</p>
        <p>SCROLLABLE IF CONTENT LONG</p>
        <p>SCROLLABLE IF CONTENT LONG</p>
      </Content>
    </>
  );

  console.log(ContentComponent, "11111");

  return dataset ? (
    <DetailsComponent
      dataset={dataset}
      onDatasetAdd={handleDatasetAdd}
      contentSection={ContentComponent}
    />
  ) : null;
};

export default DatasetDetails;

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
