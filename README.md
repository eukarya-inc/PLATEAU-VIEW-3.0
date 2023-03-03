![PLATEAU VIEW 2.0](docs/logo.png)

# PLATEAU VIEW 2.0

PLATEAU VIEW 2.0 は以下のシステムにより構成されます。

- **CMS**: ビューワーに掲載する各種データの管理を行う。[Re:Earth CMS](https://github.com/reearth/reearth-cms)を使用。
- **エディター**: ビューワーの作成・公開をノーコードで行う。[Re:Earth](https://github.com/reearth/reearth)を使用。
- **ビューワー**: PLATEAUデータなどの各種データの可視化が可能なWebアプリケーション。
- **サイドカーサーバー**: PLATEAU VIEW独自の機能を実行するCMSの補助的なサーバー。

詳細は「実証環境構築マニュアル」を参照してください。

## フォルダ構成

- [cms](cms): CMSとして採用されているOSS「[Re:Earth CMS](https://github.com/reearth/reearth-cms)」のミラー（OSS版からの変更なし）
- [editor](editor): エディターとして採用されているOSS「[Re:Earth](https://github.com/reearth/reearth)」のミラー（OSS版からの変更なし）
- [plugin](plugin): ビューワーで使用するRe:Earthのプラグイン
- [server](server): サイドカーサーバーの実装
- [terraform](terraform): PLATEAU VIEW 2.0をクラウド上に構築するためのTerraformファイル

## ライセンス

[Apache License Version 2.0](LICENSE)
