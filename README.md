<img alt="TextZen" src="./build/icon.png" width="200">

# TextZen

TextZen は MacOS 向けの Markdown ノートアプリです。

![Screenshot](./docs/screenshot.png)

## TextZen の考え方

- Markdownの記法を常に表示したい
- 複数のファイルでノートを構成したい
- オープンソースは素晴らしい

## 基本的な使いかた

### 1. フォルダを開く

TextZen では Obsidian の vaults のように特定のフォルダの下に複数の Markdown ファイルを用いてノートを管理します。
アプリを立ち上げたら `⌘+o` でフォルダを開いてください。

なお、TextZen ではフォルダを階層化することはできません。

### 2. ファイルを作成する

`⌘+n` でファイルを新規作成します。タイトル欄ではファイル名 `<タイトル>.md` のタイトルの部分を編集することができます。
エディタの使い方については後ほどご紹介します。なお、編集状態は自動で保存されます。

### 3. ファイルを検索する

`⌘+p` でファイル名で検索できます。検索結果はカーソル上下で操作することができます。

### 4. 全文検索

`⌘+Shift+f` でフォルダにあるファイルを全文検索することができます。
検索結果をクリックするとファイルの該当箇所にジャンプします。

## 記法

基本的には [GFM (GitHub Flavored Markdown)](https://docs.github.com/ja/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) に準拠しています。

### Mermaid.js

[Mermaid.js](https://mermaid.js.org/) に対応しています。

````markdown
```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```
````

### 内部リンク

開いているフォルダにある別のファイルへのリンクを作成することができます。

```markdown
[[リンク先のファイル名]]
```

## JavaScript API

JavaScript によって TextZen をカスタマイズすることができます。

`<folder>/.text-zen/**.js` で JavaScript を読み込むことができます。また、JavaScript は module として扱われるので `import` 構文を使って複数ファイルで管理することができます。

TextZen の API には `window.textZen` でアクセスしてください。

## カスタムCSS

CSS によって TextZen の見た目を変えることができます。
`<folder>/.text-zen/**.css` に CSS を作成してください。
TextZen の CSS では変数が使われています。

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-text-primary: rgb(222, 222, 222);
    --color-border-primary: rgb(90, 90, 90);
    --color-bg-primary: rgb(30, 30, 30);
    --color-bg-active: rgb(240, 240, 240, 0.15);
    --color-bg-secondary: rgb(50, 50, 50);
    --color-highlight-purple: rgb(106, 47, 126);
  }
}

@media (prefers-color-scheme: light) {
  :root {
    --color-text-primary: rgba(30, 30, 30);
    --color-border-primary: rgba(240, 240, 240);
    --color-bg-primary: rgb(256, 256, 256);
    --color-bg-active: rgb(0, 0, 0, 0.05);
    --color-bg-secondary: rgb(240, 240, 240);
    --color-highlight-purple: rgb(245, 214, 255);
  }
}
```

## 開発

以下のコマンドでアプリの開発サーバーを立ち上げることができます。

```bash
npm i
npm run dev
```

以下のコマンドでテストを実行できます。

```bash
npm run test
```

## ライセンス

© 2025 Moeki Kawakami

TextZen のソースコードは **Apache License, Version 2.0** の条件に基づいてライセンスされています。
画像リソースは、[Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License](https://creativecommons.org/licenses/by-nc-nd/4.0/) の条件に基づいてライセンスされています。
