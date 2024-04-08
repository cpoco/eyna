# eyna

Electron 製のキーボードファイラーです。  
Windows と Mac で同じファイラーを使いたかったので作りました。

ファイル操作には nodejs の fs を使用せず C++ addons で実装しています。

多画面なので、操作に多少クセがあります。

操作方法は [config/key.json](config/key.json) から雰囲気で・・

## できること

- ファイル操作
- 正規表現による再帰検索
- メディアビューア
  - gif / jpg / jpeg / png / webp
  - mp3 / m4a / ogg / wav / wave
  - mp4 / webm
- テキストビューアとテキスト比較(diff)
- バイナリビューア
- リンク 解決
  - シンボリックリンク
  - ショートカット(Windows)
  - エイリアス(Mac)
- RLO 対策

## 画面

### Windows

![](docs/img/0.0.28-win.png)

### Mac

![](docs/img/0.0.28-mac.png)

## 注意事項

ファイル操作を行う都合上、アンチウィルスソフトウェアによっては誤検知される可能性があります。
基本的には問題ないはずですが、どうしても不安な場合は使用しないことをおすすめします。
