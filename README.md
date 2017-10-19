# CelluCon.web
* https://i386koba.github.io/CelluCon.web/ で画面を開けます。
* 航路の記録は https://i386koba.github.io/CelluCon.web/mapLink.html から参照できます。
* セルコン プロジェクト全体は https://github.com/cellucon

## Android端末とPeerIDの交換
Androidのアプリ

は、自身のGoogleIDでログインし、GoogleDriveにデータコネクション待ちのPeerIDをファイル保存します。

Web画面は［Authorize GoogleID］ボタンで、Androidと同じGoogleIDでログインし、
AndroidによってGoogleDriveに保存されたPeerIDを読みに行って、
そのPeerIDでAndroiｄのPeerデータコネクションに接続しにいきます。

接続したPeerデータコネクションより、AndroidでWeb画面のPeerIDを取得し、
Web画面のPeerメディアコネクションをAndroidからコールします。

今後の予定として:　操縦をリアルタイムで共有したい。

https://github.com/nttcom/SkyWay-MultiParty-Android

SkyWay( http://nttcom.github.io/skyway/ )を用い、多人数参加のグループビデオチャットを簡単に開発できるAndroid向けのライブラリです。
