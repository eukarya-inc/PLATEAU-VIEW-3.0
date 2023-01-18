export type PlateauData = {
  id: string;
  prefecture: string; // 都道府県
  cityName: string; // city_name 市区町村名
  buildingDescription: string | null; // description_bldg
  transitDescription: string | null; // description_tran
  facilitiesDescription: string | null; // description_frn
  vegetationDescription: string | null; // description_veg
  landuseDescription: string | null; // description_luse
  landslideDescription: string | null; // description_lsld
  urbanFacilityDescription: string | null; // description_urf
  floodDescription: string[] | null; // description_fld
  tsunamiDescription: string[] | null; // description_tnum
  highTideDescription: string[] | null; // description_htd
  inlandWaterDescription: string[] | null; // description_lfld
  buildings: any[] | null; // bldg 建物モデル
  transit: any[] | null; // tran 道路
  facilities: any[] | null; // frn 都市設備
  vegetation: any[] | null; // veg 植生
  landuse: any[] | null; // luse 土地利用
  landslide: any[] | null; // lsld 土砂災害警戒区域
  urbanFacility: any[] | null; // urf 都市計画決定情報
  flood: any[] | null; // fld 浸水想定区域（洪水）
  tsunami: any[] | null; // tnum 浸水想定区域（津波）
  highTide: any[] | null; // htd 浸水想定区域（高潮）
  inlandWater: any[] | null; // lfld 浸水想定区域（内水）
  dictionary: any | null; // 辞書データ
}[];

export type UsecaseData = {
  id: string;
  name: string; // city_name
  prefecture: string; // 都道府県
  cityName: string | null; // city_name 市区町村名
  data: string | null;
  dataURL: string | null; // data_url
  dataFormat: string | null; // data_format
  dataLayer: string | null; // data_layer
  description: string | null;
  openData: string | null; // opendata
  config: string | null;
  year: string | null;
}[];

export type DatasetData = {
  id: string;
  name: string; // city_name
  prefecture: string; // 都道府県
  cityName: string | null; // city_name 市区町村名
  type: string;
  data: string | null;
  dataURL: string | null; // data_url
  dataFormat: string | null; // data_format
  description: string | null;
  openData: string | null; // opendata
}[];

export const prefectures = [
  "全国",
  "東京都",
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
];

// const secondaryDataLayer = ["東京都", ""]

export const dataTypes = [
  "建築物モデル",
  "避難施設",
  "ランドマーク",
  "鉄道駅",
  "道路モデル",
  "植生",
  "都市設備",
  "土地利用",
  "土砂災害警戒区域",
  "都市計画決定情報", // Sub as-is
  "洪水浸水想定区域", // Sub by name
  "津波浸水想定区域", // Sub by name
  "高潮浸水想定区域", // Sub by name
  "内水浸水想定区域", // Sub by name
  "緊急輸送道路",
  "鉄道",
  "公園",
  "行政界",
  "ユースケース", // Sub by name
];
