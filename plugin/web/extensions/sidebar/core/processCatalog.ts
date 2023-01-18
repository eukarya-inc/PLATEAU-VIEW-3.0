import { TEST_PLATEAU_DATA, TEST_USECASE_DATA, TEST_DATASET_DATA } from "./TEST_DATA";

type ModelType = "plateau" | "usecase" | "dataset";

export type CatalogRawItem = {
  id: string;
  name?: string;
  prefecture: string; // 都道府県
  cityName: string; // city_name 市区町村名
  description?: string | null;
  descriptionBldg?: string | null; // description_bldg
  descriptionTran?: string | null; // description_tran
  descriptionFrn?: string | null; // description_frn
  descriptionVeg?: string | null; // description_veg
  descriptionLuse?: string | null; // description_luse
  descriptionLsld?: string | null; // description_lsld
  descriptionUrf?: string | null; // description_urf
  descriptionFld?: string[] | null; // description_fld
  descriptionTnum?: string[] | null; // description_tnum
  descriptionHtd?: string[] | null; // description_htd
  descriptionLfld?: string[] | null; // description_lfld
  bldg?: any[] | null; // bldg 建物モデル
  tran?: any[] | null; // tran 道路
  frn?: any[] | null; // frn 都市設備
  veg?: any[] | null; // veg 植生
  luse?: any[] | null; // luse 土地利用
  lsld?: any[] | null; // lsld 土砂災害警戒区域
  urf?: any[] | null; // urf 都市計画決定情報
  fld?: any[] | null; // fld 浸水想定区域（洪水）
  tnum?: any[] | null; // tnum 浸水想定区域（津波）
  htd?: any[] | null; // htd 浸水想定区域（高潮）
  lfld?: any[] | null; // lfld 浸水想定区域（内水）
  dictionary?: any | null; // 辞書データ
  data?: string | null;
  dataURL?: string | null; // data_url
  dataFormat?: string | null; // data_format
  dataLayer?: string | null; // data_layer
  openData?: string | null; // opendata
  config?: string | null;
  year?: string | null;
  type?: string | null;
  modelType?: ModelType;
  tags?: Tag[];
};

export type Tag = {
  type: "location" | "data-type";
  name: string;
};

export type CatalogItem =
  | ({
      type: "item";
    } & CatalogRawItem)
  | {
      type: "group";
      name: string;
      children: CatalogItem[];
    };

export type DataCatalog = CatalogItem[];

export default (plateauData: any[], usecaseData: any[], datasetData: any[]) => {
  const rawPlateauData = convertRaw(
    plateauData.length > 0 ? plateauData : TEST_PLATEAU_DATA,
    "plateau",
  ); // REMOVE TEST DATA WHEN FINISHED TESTING
  const rawUsecaseData = convertRaw(
    usecaseData.length > 0 ? usecaseData : TEST_USECASE_DATA,
    "usecase",
  ); // REMOVE TEST DATA WHEN FINISHED TESTING
  const rawDatasetData = convertRaw(
    datasetData.length > 0 ? datasetData : TEST_DATASET_DATA,
    "dataset",
  ); // REMOVE TEST DATA WHEN FINISHED TESTING

  return [...rawPlateauData, ...rawUsecaseData, ...rawDatasetData];
};

function convertRaw(data?: any[], modelType?: ModelType): CatalogRawItem[] {
  if (!data || data.length <= 0) return [];

  return data.map(item => {
    const rawItem: CatalogRawItem = {
      id: item.id,
      name: item.name,
      prefecture: item.prefecture,
      cityName: item.city_name,
      description: item.description,
      descriptionBldg: item.description_bldg,
      descriptionTran: item.description_tran,
      descriptionFrn: item.description_frn,
      descriptionVeg: item.description_veg,
      descriptionLuse: item.description_luse,
      descriptionLsld: item.description_lsld,
      descriptionUrf: item.description_urf,
      descriptionFld: item.description_fld,
      descriptionTnum: item.description_tnum,
      descriptionHtd: item.description_htd,
      descriptionLfld: item.description_lfld,
      bldg: item.bldg,
      tran: item.tran,
      frn: item.frn,
      veg: item.veg,
      luse: item.luse,
      lsld: item.lsld,
      urf: item.urf,
      fld: item.fld,
      tnum: item.tnum,
      htd: item.htd,
      lfld: item.lfld,
      dictionary: item.dictionary,
      data: item.data,
      dataURL: item.data_url,
      dataFormat: item.data_format,
      dataLayer: item.data_layer,
      openData: item.opendata,
      config: item.config,
      year: item.year,
      type: item.type,
      modelType,
      tags: [
        { name: item.prefecture, type: "location" },
        { name: item.city_name, type: "location" },
        { name: item.data_format, type: "data-type" },
        { name: item.type, type: "data-type" },
      ].filter(t => !!t.name) as Tag[],
    };
    return Object.fromEntries(
      Object.entries(rawItem).filter(([_, v]) => v != null),
    ) as CatalogRawItem;
  });
}
