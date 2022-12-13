import { Catalog } from "@web/extensions/sidebar/modals/datacatalog/types";

export const TEST_CATALOG_DATA: Catalog = [
  {
    id: "//PLATEAU データセット",
    name: "PLATEAU データセット",
    type: "group",
    isOpen: true,
    members: [
      {
        id: "//PLATEAU データセット/全球データ",
        name: "全球データ",
        type: "group",
        members: [
          {
            id: "//PLATEAU データセット/全球データ",
            name: "全球データ",
            type: "3d-tiles",
            url: "www.google.ca",
            tags: [{ name: "全球", type: "location" }], // TAG FIELD IS NEW. NOT A PART OF PLATEAU V1's JSON FILE LIKE THE OTHER VALUES.
            description:
              "PLATEAU VIEWではAPIから利用可能なリアルタイムデータ（CSV形式）の重畳テストのため、本データの登録、表示を行っています。<br/>\n本データは、米国地質調査所（USGS）から配信されている地震モニタリングデータです。米国議会によって設立された国家地震災害軽減プログラム（NEHRP）の一環として提供されています。<br/>\nデータ時点：過去３０日に観測されたマグニチュード2.5以上の地震情報を1分間隔で更新<br/>\n出典：米国地質調査所（USGS）国家地震災害軽減プログラム（NEHRP）<br/>\nhttps://earthquake.usgs.gov/earthquakes/feed/v1.0/csv.php\n",
            customProperties: {
              initialCamera: {
                east: 139.778615077544,
                north: 35.6942105587296,
                south: 35.6704817378196,
                west: 139.732014593078,
                direction: {
                  x: 0.72586911731469,
                  y: -0.572881966701693,
                  z: 0.38068395915351,
                },
                position: {
                  x: -3961600.64774147,
                  y: 3352960.1331386,
                  z: 3698257.11853344,
                },
                up: {
                  x: -0.278272637118043,
                  y: 0.261555059913582,
                  z: 0.9242041387404472,
                },
              },
            },
          },
          {
            id: "//PLATEAU データセット/全球データ/NASA推定降水量データ（Global/IMERG_30Min）",
            name: "NASA推定降水量データ（Global/IMERG_30Min）",
            type: "wms-no-description",
            url: "https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi",
            tags: [{ name: "全球", type: "location" }], // TAG FIELD IS NEW. NOT A PART OF PLATEAU V1's JSON FILE LIKE THE OTHER VALUES.
            customProperties: {
              initialCamera: {
                east: 159.10274514267203,
                north: 44.2621830483445,
                south: 28.407813038126683,
                west: 116.50761045435345,
                direction: {
                  x: 0.591660404128671,
                  y: -0.5351207673080874,
                  z: -0.6029790465529475,
                },
                position: {
                  x: -5514501.416861525,
                  y: 4995520.577210467,
                  z: 5714097.868497332,
                },
                up: {
                  x: 0.4852855904358131,
                  y: -0.3608526102003768,
                  z: 0.7964190413513099,
                },
              },
            },
            description:
              "PLATEAU VIEWではAPIから利用可能なリアルタイムデータ（WMS形式）の重畳テストのため、本データの登録、表示を行っています。<br/>\n本データは、NASAから配信されている全球降水観測計画（GPM）の統合マルチ衛星検索（IMERG）に格納されている降水量データ（10分の1ミリメートル（mm x 10 ^ 1）で測定）です。<br/>\nデータ時点：30分ごとに更新<br/>\n出典：NASA全球降水観測計画（GPM）<br/>\nhttps://gpm.nasa.gov/data/imerg\n",
          },
        ],
      },
      {
        id: "//PLATEAU データセット/東京都",
        name: "東京都",
        type: "group",
        isOpen: false,
        members: [
          {
            id: "//PLATEAU データセット/東京都/東京都23区/千代田区",
            name: "千代田区",
            type: "group",
            isOpen: false,
            members: [
              {
                id: "//PLATEAU データセット/東京都/東京都23区/千代田区/建物モデル（千代田区）",
                name: "建物モデル（千代田区）",
                type: "3d-tiles",
                url: "https://d2jfi34fqvxlsc.cloudfront.net/main/data/3d-tiles/bldg/13100_tokyo/13101_chiyoda-ku/notexture/tileset.json?20220331",
                tags: [
                  { name: "東京都", type: "location" },
                  { name: "建物モデル", type: "data-type" },
                ], // TAG FIELD IS NEW. NOT A PART OF PLATEAU V1's JSON FILE LIKE THE OTHER VALUES.
                customProperties: {
                  initialCamera: {
                    east: 139.778615077544,
                    north: 35.6942105587296,
                    south: 35.6704817378196,
                    west: 139.732014593078,
                    direction: {
                      x: 0.72586911731469,
                      y: -0.572881966701693,
                      z: 0.38068395915351,
                    },
                    position: {
                      x: -3961600.64774147,
                      y: 3352960.1331386,
                      z: 3698257.11853344,
                    },
                    up: {
                      x: -0.278272637118043,
                      y: 0.261555059913582,
                      z: 0.9242041387404472,
                    },
                  },
                },
                description:
                  "土地利用現況・建物現況調査の結果や航空写真等を用いて構築したLOD1及びLOD2の3D都市モデル。<br/>テクスチャ付きのLOD2モデルは都市再生特別措置法第2条第3項に基づく都市再生緊急整備地域（緊急かつ重点的に市街地の整備を推進すべき地域）を中心に構築。<br/>都市計画法第6条に基づく都市計画基礎調査等の土地・建物利用情報等を建物の属性情報として付加。<br/>仕様書等と併せて政府標準利用規約に則ったオープンデータとして公開済み。<br/><br/>〔モデル作成〕<br/>国際航業株式会社<br/>https://www.kkc.co.jp/<br/><br/>〔モデル編集・変換〕<br/>株式会社三菱総合研究所・Pacific Spatial Solutions株式会社<br/><br/>〔出典〕<br/>建物図形：土地利用現況・建物現況調査（東京都）（2016年・2017年）<br/>計測高さ：LOD1 航空レーザー測量（国際航業株式会社）（2020年）<br/>　　　　　LOD2 航空写真測量（国際航業株式会社）（2020年）<br/>建物テクスチャ：航空写真（国際航業株式会社）（2020年）<br/>建物現況：建物現況調査（東京都）（2016年・2017年）<br/>建物名称：国土基本情報（国土地理院）（2020年）（国土地理院長承認（使用）R2JHs844）<br/>　　　　　国土数値情報（鉄道データ）（国土交通省）（2019年）<br/>　　　　　（https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N02-v2_3.html）<br/>都市計画決定情報：都市計画決定情報GISデータ（東京都）（2018年9月30日）<br/>土砂災害警戒区域：国土数値情報（国土交通省）（2019年）<br/>津波浸水想定：東京都津波浸水想定（東京都）（2013年）<br/>洪水浸水想定区域：<br/>　荒川水系荒川浸水想定区域図（国土交通省）（2016年）<br/>　利根川水系江戸川浸水想定区域図（国土交通省）（2017年）<br/>　利根川水系利根川洪水浸水想定区域図（国土交通省）（2017年）<br/>　多摩水系多摩川浸水想定区域図（国土交通省）（2016年）<br/>　荒川水系神田川流域浸水予想区域図（東京都）（2018年）<br/>　荒川水系石神井川及び白子川浸水予想区域図（東京都都市型水害対策連絡会）（2019年）<br/>　江東内部河川流域浸水予想区域図（東京都都市型水害対策連絡会）（2020年）<br/>　城南地区河川流域浸水予想区域図（東京都都市型水害対策連絡会）（2019年）<br/>　野川、仙川、入間川、谷沢川及び丸子川流域浸水予想区域図（東京都都市型水害対策連絡会）（2019年）<br/><br/>〔留意点〕<br/>・LOD1の「計測高さ」は、航空レーザー測量によって取得した建物図形内の点群データのうち、ノイズ除去のために最高値以下５％を除去した点群の最高値としています。<br/>・LOD1のモデルの見た目上の高さは航空レーザー測量によって取得した建物図形内の点群データの中央値としています。また、「計測高さ」を取得できなかった建物の見た目上の高さは一律3mとしています。<br/>・出典情報の取得年次により、必ずしも最新の状況を反映していない場合があります。<br/>・都市の区域外の建物が含まれている場合があります。",
              },
            ],
          },
        ],
      },
    ],
  },
];
