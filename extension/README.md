# PLATEAU VIEW 3.0 extension for Re:Earth

## Development

```sh
yarn && yarn dev
```

Then, set the `localhost` to env file in `reearth` repository.

1. Move to `reearth` repository.
2. Open `/server/.env`, and set `REEARTH_EXT_PLUGIN=http://localhost:5001`.
3. Open `/web/.env`, and set `REEARTH_WEB_UNSAFE_PLUGIN_URLS='["http://localhost:5001/PLATEAUVIEW3.js"]'`
4. Run server and web.

## Architecture

- toolbar ... Main logic for toolbar widget
- search ... Main logic for search widget
- inspector ... Main logic for inspector widget
- streetView ... Main logic for street view widget
- prototypes ... Modules which are ported from [takram-design-engineering/plateau-view](https://github.com/takram-design-engineering/plateau-view).
- shared/ ... Shared logic between widgets
    - constants/ ... Constant variables definition
    - context/ ... Shared context. `WidgetContext` is used for each widget.
    - sharedAtoms/ ... Wrapped Jotai's atoms for abstracting side-effects
    - states/ ... Global state definitions
    - graphql/ ... Functions related to GQL include react hooks.
    - helpers/ ... Helper functions for specific use case
    - layerContainers/ ... Connect a lot of atoms(states) with specific layer component.
    - plateau/ ... Plateau specific module
    - reearth/ ... Bundle ReEarth functions.
    - view/ ... Abstraction layer for `prototypes/view`
      - fields/ ... Field components definition.
        - general/ ... Field components for general use.
        - polygon/ ... Field components for polygon.
        - point/ ... Field components for point.
        - 3dtiles/ ... Field components for 3dtiles.
        - ...etc
    - view-layers/ ... Abstraction layer for `prototypes/view-layers`
        - 3dtiles/
        - general/ ... Almost layers which don't need a layer specific logic are defined in here.
        - ...etc
    - api/
        - types/ ... Common interface definition between viewer and editor

## 地域メッシュヒートマップのセットアップ

以下2種類の全データをダウンロードし、`public` ディレクトリ配下にそれぞれ配置します。
- [国勢調査5次メッシュ人口及び世帯](https://www.e-stat.go.jp/gis/statmap-search?page=1&type=1&toukeiCode=00200521&toukeiYear=2020&aggregateUnit=Q&serveyId=Q002005112020&statsId=T001102&datum=2000) の全データを `public/T001102/` 配下に展開
- [国勢調査5次メッシュ人口移動、就業状態等及び従業地・通学地](https://www.e-stat.go.jp/gis/statmap-search?page=1&type=1&toukeiCode=00200521&toukeiYear=2020&aggregateUnit=Q&serveyId=Q002005112020&statsId=T001109&datum=2000) の全データを `public/T001109/` 配下に展開

次に `yarn decode-estat` を実行し、ダウンロードしたすべてのファイルを Shift-JIS から UTF-8 に変換します。
