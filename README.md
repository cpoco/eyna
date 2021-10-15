![](docs/img/app.png)

Electron 製のキーボードファイラー  
Windows と Mac で同じファイラーを使いたかったので作りました

ファイル操作には nodejs の fs を使用せず  
C++ addons（主に Boost Filesystem Library）で実装

多画面なので操作に多少クセがあります

操作方法は [config/key.json](config/key.json) から雰囲気で・・
