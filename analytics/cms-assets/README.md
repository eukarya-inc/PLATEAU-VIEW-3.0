# CMS アセットのアクセス分析

PLATEAU CMS のアセット配信（`/assets/<uuid[0:2]>/<uuid[2:]>/...`）について、どのデータが・どこから・どれだけアクセスされ、配信コストがいくらかかっているかを BigQuery で集計し、Looker Studio のレポートで見るための仕組みである。

このディレクトリには、日次集計とビューの SQL、レポートのデータソースに使っている SQL、集計の仕組みの説明を置く。ログの取り込み、スケジュールクエリ、テーブルとビューは GCP 側のインフラ（Terraform）で管理している。

## 全体の流れ

```
外部 ALB + Cloud CDN（backend bucket）のリクエストログ
  └─ Log Analytics バケット（90 日保持）
       └─ リンク済み BigQuery データセット cms_assets_requests_analytics（生ログ）
            └─ スケジュールクエリ（毎日 01:30 UTC、前日 1 日分）
                 └─ cms_assets_analytics の集計テーブル
                      └─ Looker Studio のカスタムクエリ（このディレクトリの SQL）

データカタログ ── asset index エクスポート（毎日 04:00 JST）──> asset_index
```

- アセットとデータカタログの対応は、サーバーの asset index エクスポート（`go run . --export-asset-index`、[server/docs/plateau-view-data-flow.md](../../server/docs/plateau-view-data-flow.md) の「アセットインデックスの出力」）で作る。BigQuery からは外部テーブル `asset_index` として読む。
- 日付はすべて UTC で区切る。

## テーブルとビュー

プロジェクト `reearth-plateau`、データセット `cms_assets_analytics`（asia-northeast1）。

| 名前 | 種類 | 内容 |
|---|---|---|
| `daily_usage` | テーブル | 日 × アセット × ファイル × ホスト × リファラ × UA × エッジ × 国 × ASN × キャッシュ状態ごとのリクエスト数・転送量・IP 数 |
| `daily_clients` | テーブル | 日 × リファラ × UA × 国 × ASN ごとのリクエスト数・転送量・IP 数（ファイルの区別なし） |
| `daily_asset_clients` | テーブル | 日 × アセット × ファイル × リファラ × UA × 国 × ASN ごとのリクエスト数・転送量・IP 数（キャッシュ状態の区別なし） |
| `asset_index_daily` | テーブル | `asset_index` の日次スナップショット |
| `asset_dim` | ビュー | アセットごとに 1 件の参照先。カタログから外れたアセットも最後に見えたときの参照先を残す |
| `daily_cost` | ビュー | `daily_usage` にクライアント種別・アクセス元・ASN 名・推定コストを付けたもの |
| `unit_price` / `country_region` | ビュー | 推定コストに使う単価と、国から課金リージョンへの対応 |
| `ipv4_country` / `ipv4_asn` | テーブル | IP アドレスから国・ASN を引く表（DB-IP Lite） |
| `storage_by_asset` / `storage_cost` | テーブル / ビュー | アセットごとの保存容量と保存コスト（Storage Insights のインベントリから週 1 回） |

集計テーブルには生の値（リファラのホスト、UA など）をそのまま持たせ、クライアント種別やアクセス元の分類はビュー（`daily_cost`）で行う。分類のルールを変えても、過去の日を集計し直さずに済む。

## 日次集計とビューの SQL

[bigquery/](bigquery/) は、インフラ側の Terraform が使っている SQL の写しである。正本はインフラ側にあり、こちらを変えても本番には反映されない。インフラ側を変えたときは、こちらも合わせて更新する。

| ファイル | 使われ方 |
|---|---|
| [cms_assets_daily.sql.tftpl](bigquery/cms_assets_daily.sql.tftpl) | スケジュールクエリ（毎日 01:30 UTC）。前日分を `daily_usage`・`daily_clients`・`daily_asset_clients` に集計し、`asset_index_daily` にスナップショットを取る |
| [cms_assets_storage.sql.tftpl](bigquery/cms_assets_storage.sql.tftpl) | スケジュールクエリ（週 1 回）。最新の GCS インベントリをアセットごとに合計して `storage_by_asset` に書く |
| [cms_assets_daily_cost.sql.tftpl](bigquery/cms_assets_daily_cost.sql.tftpl) | ビュー `daily_cost` |
| [cms_assets_asset_dim.sql.tftpl](bigquery/cms_assets_asset_dim.sql.tftpl) | ビュー `asset_dim` |
| [cms_assets_storage_cost.sql.tftpl](bigquery/cms_assets_storage_cost.sql.tftpl) | ビュー `storage_cost` |
| [cms_assets_unit_price.sql](bigquery/cms_assets_unit_price.sql) | ビュー `unit_price` |
| [cms_assets_country_region.sql](bigquery/cms_assets_country_region.sql) | ビュー `country_region` |

`.tftpl` は Terraform の `templatefile` で次の変数を埋めてから使う。

- `${dataset}`：集計先のデータセット（`reearth-plateau.cms_assets_analytics`）
- `${logs_dataset}`：生ログのリンク済みデータセット（`reearth-plateau.cms_assets_requests_analytics`）

`@run_date` はスケジュールクエリの実行日（UTC）で、手で実行するときはクエリパラメータとして渡す。

## 集計で気をつけること

- **IP 数は足せない。** 各テーブルの `ips` は、その行の中で数えた異なる IP の数である。同じ IP が複数のファイルや UA を使うと、行を足したときに重なって数えられる。
  - `daily_usage.ips` を足すと、実際の数の 3〜19 倍になる。
  - アクセス元別に見るときは `daily_clients`、データ別に見るときは `daily_asset_clients` から IP 数を取る。重なりは、前者はわずか、後者は +15% 程度に収まる。
  - 正確な数が必要なときは、生ログから `COUNT(DISTINCT remote_ip)` で数える。
- **CDN 自身の再検証リクエストを除く。** UA が `Cloud-CDN-Google` で始まる行は CDN がオリジンに再検証したリクエストで、元のクライアントの IP で記録される。IP 数からは除く。
- **ログは最大 24 時間遅れて届く。** 前日分を 01:30 UTC に集計するため、リクエストの 0.02% ほどが集計から漏れる。
- **1 つのアセットに複数の参照先がある。** `asset_index.refs` は配列で、同じアセットを複数のデータセットが参照することがある。合計する前に 1 件に絞る（`asset_dim` を使う）。

## 推定コスト

`daily_cost` のコストは、使用量に単価を掛けた推定値（円）である。請求額そのものではない。単価は固定の値を使っている。

| 列 | 対象 |
|---|---|
| `cdn_egress_jpy` | キャッシュを通った転送量 × Cloud CDN のキャッシュ配信単価（地域別） |
| `internet_egress_jpy` | キャッシュを通らない転送量 × インターネット向け egress 単価（地域別）。Cloud CDN は 1 オブジェクト 100 GiB までしかキャッシュしないため、巨大な zip はこちらになる |
| `cache_fill_jpy` | キャッシュフィル量 × キャッシュフィル単価 |
| `cache_lookup_jpy` | キャッシュルックアップ数 × ルックアップ単価 |
| `gcs_ops_jpy` | キャッシュヒットしなかったリクエスト数 × GCS Class B オペレーション単価 |

推定コストの合計は、この 5 列の和である。

## レポートとデータソース

レポートは社内向けと国土交通省向けの 2 つがあり、それぞれ「アクセス元」と「自治体・データ別」のページを持つ。国交省向けには IP アドレスとコストを出さない。

| ファイル | レポート・ページ | 接続 | 期間 |
|---|---|---|---|
| [looker-studio/internal-sources.sql](looker-studio/internal-sources.sql) | 社内・アクセス元 | 抽出（毎日更新） | 全期間 |
| [looker-studio/internal-ips.sql](looker-studio/internal-ips.sql) | 社内・アクセス元の IP アドレス別の表 | 抽出（毎日更新） | 生ログの直近 90 日 |
| [looker-studio/internal-assets.sql](looker-studio/internal-assets.sql) | 社内・自治体・データ別 | BigQuery に直接接続 | 全期間 |
| [looker-studio/mlit-sources.sql](looker-studio/mlit-sources.sql) | 国交省・アクセス元 | 抽出（毎日更新） | 全期間 |
| [looker-studio/mlit-assets.sql](looker-studio/mlit-assets.sql) | 国交省・自治体・データ別 | 抽出（毎日更新） | 直近 180 日 |

- 抽出には 100 MB・200 万行の上限がある。社内・自治体・データ別は 1 日あたり約 3 MB あり、抽出では 1 か月ほどしか入らないため、BigQuery に直接接続している。国交省・自治体・データ別は 1 日あたり約 0.55 MB なので、直近 180 日に絞って抽出を使っている。
- 国・リファラ・ASN・UA・IP アドレスは、件数の多い上位だけを残し、残りを「(その他)」にまとめている。

### SQL の更新手順

データソースはレポートに埋め込まれているので、レポートの編集画面から更新する。

1. 「リソース」>「追加済みのデータソースの管理」で対象のデータソースの「編集」を開く。
2. 「接続を編集」でカスタムクエリを書き換え、「再接続」する。フィールドが変わる場合は確認ダイアログで「適用」する。
3. 抽出を使っているページは、抽出のデータソースを開き直して「保存して抽出」する。

抽出をやり直すと、抽出側で付けたフィールド名は元のデータソースの名前に戻る。表示用の日本語名は、元のデータソース（BigQuery のカスタムクエリ）のほうに付けておく。

## 帰属表示

IP アドレスから国と ASN を引くのに、[DB-IP](https://db-ip.com) の IP to Country Lite / IP to ASN Lite（CC BY 4.0）を使っている。レポートにも帰属を表示する。

表は月ごとに配布される `dbip-country-lite-YYYY-MM.csv` / `dbip-asn-lite-YYYY-MM.csv` から作る。IPv4 の範囲だけを取り、範囲結合を速くするため、範囲がまたがる /16 ごとに行を分けて `bucket = DIV(ip, 65536)` を持たせる。
