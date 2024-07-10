# PLATEAU VIEW3.0 Backend

This app refers [takram-design-engineering/plateau-view](https://github.com/takram-design-engineering/plateau-view/).

## Installation

```bash
yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## 地域メッシュヒートマップのセットアップ

以下2種類の全データをダウンロードし、`public` ディレクトリ配下にそれぞれ配置します。
- [国勢調査5次メッシュ人口及び世帯](https://www.e-stat.go.jp/gis/statmap-search?page=1&type=1&toukeiCode=00200521&toukeiYear=2020&aggregateUnit=Q&serveyId=Q002005112020&statsId=T001102&datum=2000) の全データを `public/T001102/` 配下に展開
- [国勢調査5次メッシュ人口移動、就業状態等及び従業地・通学地](https://www.e-stat.go.jp/gis/statmap-search?page=1&type=1&toukeiCode=00200521&toukeiYear=2020&aggregateUnit=Q&serveyId=Q002005112020&statsId=T001109&datum=2000) の全データを `public/T001109/` 配下に展開

次に `yarn decode-estat` を実行し、ダウンロードしたすべてのファイルを Shift-JIS から UTF-8 に変換します。
