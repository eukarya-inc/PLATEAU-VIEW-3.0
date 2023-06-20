# PLATEAU VIEW 3.0

**※開発中です / Under in development**

PLATEAU VIEW 3.0 は以下のシステムにより構成されます。

- **PLATEAU CMS**: ビューワーに掲載する各種データの管理を行う。
- **PLATEAU Editor**: ビューワーの作成・公開をノーコードで行う。
- **PLATEAU VIEW**: 様々なPLATEAU関連データセットの可視化が可能なWebアプリケーション。

## フォルダ構成

- [cms](cms): PLATEAU CMS
- [editor](editor): PLATEAU Editorとして採用されているOSS「[Re:Earth](https://github.com/reearth/reearth)」のミラー
- [extension](extension): PLATEAU VIEWで使用するRe:Earthのエクステンション
- [server](server): PLATEAU CMS のサイドカーサーバー（CMSと共に補助的に動作するサーバーアプリケーション）
- [terraform](terraform): PLATEAU VIEW 2.0をクラウド上に構築するためのTerraform

## ライセンス

[Apache License Version 2.0](LICENSE)
