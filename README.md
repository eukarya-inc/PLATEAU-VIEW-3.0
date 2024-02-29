# PLATEAU VIEW 3.0

**※開発中です / Under in development**

PLATEAU VIEW 3.0 は以下のシステムにより構成されます。

- **PLATEAU CMS**: ビューワーに掲載する各種データの管理・配信を行う。
- **PLATEAU Editor**: ビューワーの作成・公開をノーコードで行う。
- **PLATEAU VIEW**: PLATEAUをはじめとする様々なデータセットの可視化が可能なWebアプリケーション。

## フォルダ構成

- [cms](cms): PLATEAU CMS（[Re:Earth CMS](https://github.com/reearth/reearth-cms)）
- [editor](editor): PLATEAU Editor（[Re:Earth](https://github.com/reearth/reearth)）
- [extension](extension): PLATEAU VIEW で使用する Re:Earth のエクステンション
- [geo](geo): PLATEAU VIEW の一部機能（住所検索など）を動作させるためのサーバー
- [server](server): PLATEAU CMS のサイドカーサーバー（CMSと共に補助的に動作するサーバーアプリケーション）
- [tools](tools): PLATEAU CMS でのデータ登録作業などを補助するCLIツール
- [terraform](terraform): PLATEAU VIEW 3.0　をクラウド上に構築するための Terraform

## ライセンス

[Apache License Version 2.0](LICENSE)
