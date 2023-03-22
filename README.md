![PLATEAU VIEW 2.0](docs/logo.png)

# PLATEAU VIEW 2.0

PLATEAU VIEW 2.0 は以下のシステムにより構成されます。

- **PLATEAU CMS**: ビューワーに掲載する各種データの管理を行う。[Re:Earth CMS](https://github.com/reearth/reearth-cms)を使用。
- **PLATEAU Editor**: ビューワーの作成・公開をノーコードで行う。[Re:Earth](https://github.com/reearth/reearth)を使用。
- **PLATEAU VIEW**: PLATEAUデータなどの各種データの可視化が可能なWebアプリケーション。

詳細は「実証環境構築マニュアル」を参照してください。

## フォルダ構成

- [cms](cms): PLATEAU CMS
- [editor](editor): PLATEAU Editorとして採用されているOSS「[Re:Earth](https://github.com/reearth/reearth)」のミラー
- [plugin](plugin): PLATEAU VIEWで使用するRe:Earthのプラグイン
- [server](server): PLATEAU CMS のサイドカーサーバー
- [terraform](terraform): PLATEAU VIEW 2.0をクラウド上に構築するためのTerraformファイル

## ライセンス

[Apache License Version 2.0](LICENSE)
