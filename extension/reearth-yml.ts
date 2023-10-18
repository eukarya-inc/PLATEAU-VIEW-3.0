import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { stringify } from "yaml";

import pkg from "./package.json" assert { type: "json" };

const yml = {
  id: "plateau-view-3",
  name: "PLATEAUVIEW3.0",
  version: pkg.version,
  extensions: [
    {
      id: "toolbar-widget",
      type: "widget",
      name: "Toolbar",
      widgetLayout: {
        extendable: {
          horizontally: true,
        },
        defaultLocation: {
          zone: "outer",
          section: "center",
          area: "top",
        },
        extended: true,
      },
      schema: {
        groups: [
          {
            id: "default",
            title: "PLATEAUデータセット",
            fields: [
              {
                id: "plateauURL",
                type: "string",
                title: "バックエンドURL",
              },
              {
                id: "geoURL",
                type: "string",
                title: "GeoサーバーバックエンドURL",
              },
              {
                id: "projectName",
                type: "string",
                title: "プロジェクト名",
              },
              {
                id: "plateauAccessToken",
                type: "string",
                title: "バックエンドアクセストークン",
                private: true,
              },
              {
                id: "catalogURL",
                type: "string",
                title: "データカタログURL",
              },
              {
                id: "catalogProjectName",
                type: "string",
                title: "データカタログのプロジェクト名",
              },
              {
                id: "reearthURL",
                type: "string",
                title: "Re:Earthプロジェクトの公開URL",
              },
              {
                id: "enableGeoPub",
                type: "bool",
                title: "G空間情報センターに公開",
              },
              {
                id: "hideFeedback",
                type: "bool",
                title: "フィードバックを非表示",
              },
            ],
          },
        ],
      },
    },
    {
      id: "search-widget",
      type: "widget",
      name: "Search",
      widgetLayout: {
        extendable: {
          vertically: true,
        },
        defaultLocation: {
          zone: "inner",
          section: "left",
          area: "middle",
        },
        extended: true,
      },
    },
    {
      id: "inspector-widget",
      type: "widget",
      name: "Inspector",
      widgetLayout: {
        extendable: {
          vertically: true,
        },
        defaultLocation: {
          zone: "inner",
          section: "right",
          area: "middle",
        },
        extended: true,
      },
    },
    {
      id: "editor-widget",
      type: "widget",
      name: "Editor",
      widgetLayout: {
        defaultLocation: {
          zone: "outer",
          section: "right",
          area: "top",
        },
      },
    },
  ],
};

writeFileSync(resolve("./reearth.yml"), stringify(yml));
