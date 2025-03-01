---
title: "Chrome拡張のUI部分をWebページとして実行してデバッグできるようにしてみた"
description: "AIツールの恩恵を受けるためにChrome拡張のUI部分をChrome拡張機能環境に依存しないようにしたときの備忘録"
pubDate: "Feb 28 2025"
heroImage: "/blog-placeholder-2.jpg"
blogID: "01JN63XZXGTDT36V2H8QQEFDW5"
---

#### はじめに

今回は Devin が開発しやすいように 拡張機能(以下 拡張機能)の UI 部分を Web アプリケーションとして実行する方法について話します。

私はアルバイト先で Chrome 拡張機能の開発をしています。そこで開発に Devin を使ってみることになったので、popup 画面の UI を Devin の実行環境でもデバッグしやすいように、Chrome 拡張の環境から分離してみることになりました。その方法を備忘録として残しておきます。

#### この記事が扱うこと/扱わないこと

---

**扱うこと**

- 拡張機能の UI 部分だけを Web ページとして実行する方法

**扱わないこと**

- 拡張機能の作り方
- 拡張機能としての実行と Web ページとしての実行で Devin の開発効率にどれくらいの差異があるかの比較

#### 拡張機能の Popup のみを Web ページとして切り出す方法

---

**完成イメージ**

ブラウザで index.html を開いたとき
![extension-on-web](/public/chrome-extension-web.png)

chrome 拡張として Popup を開いたとき
![extension](/public/chrome-extension.png)

Web ページ化するにあたって以下のような作業が必要です。

1. 拡張機能に vite などのサーバーを立ち上げるツールが入ってない場合は入れる
2. `http://localhost:[PORT]/path_to_index.html`からブラウザで index.html を開けるようにする
3. css を修正して 拡張機能の Popup と同じ大きさ・レイアウトになるようにする
4. 拡張機能特有の関数をモックする

今回は [WXT](https://wxt.dev/) というライブラリを使った場合の手順を説明します。
[実装例](https://github.com/Tetsu-is/chrome-extension-demo-app)

WXT は vite ベースのライブラリなので拡張機能の Popup と index.html のホットリロードができて、標準の状態で index.html をブラウザから開けるので ① ② の作業は不要になります。

`http://localhost:3000/entrypoints/popup/index.html`をブラウザで開けば拡張機能と同じコンポーネントが表示されます。

③ では Web ページのときは画面サイズいっぱいまでコンポーネントが広がってしまうので`max-width`などで調整します。今回はやっていませんが user-agent の css を無効化するために reset css か tailwind の preflight などを使用したほうが良いと思います。

④ は少し面倒なのでコードを使って説明します。拡張機能側では`chrome.runtime.sendMessage()`を使って Popup と Service Worker の間でメッセージングをするのですが、Web ページにはその API がないので`sendMessage()`を使おうとすると以下のようなエラーが出てしまいます。

```
//index.htmlを開いたブラウザのconsole

App.tsx:10 Uncaught TypeError: Cannot read properties of undefined (reading 'sendMessage')
    at handleClickButton (App.tsx:10:20) // chrome.runtime.sendMessage()というメソッドがない
```

なので`sendMessage()`のモックを用意して chrome.runtime を無理やり上書きします。

```tsx
// main.tsx

if (import.meta.env.VITE_DEVELOPMENT === "true") {
  window.chrome = newMockChrome(); // sendMessage()をモックしたchromeを返す
}
```

```ts
// mockする本来の処理 entrypoints/background.ts
export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Received message:", message);
    sendResponse({ message: "Hello from background!" });
    return true;
  });
});
```

```ts
// entrypoints / mock / chrome.ts;

type MockMessage = {
  message: string;
  // Add any additional properties if needed, or remove this line if not required
};

type MockResponse = {
  message: string;
};

function sendMessage( // sendMessageはresponseを引数に持つcallbackを実行する
  message: MockMessage,
  callback?: (response: MockResponse) => void
) {
  // 今回はsendMessageを読んでbackground.tsが返答を返すまでの部分をmockする
  // いくか処理がある場合は、それぞれ振る舞いをmockする
  const response: MockResponse = {
    message: "Hello from background!",
    ...
  };

  if (callback) {
    callback(response);
  }
}

export function newMockChrome(): any {
  return {
    ...chrome,
    runtime: {
      ...chrome.runtime,
      sendMessage: sendMessage,
    },
  };
}
```

これで sendMessage()を使ってもエラーが起こら内容になると思います。API のフェッチであれば待ち時間を作ったり、乱数で失敗するようにすると良いかと思いました。

#### より細かく拡張機能を再現したい場合

- sendMessage 以外のメソッドの mock
- 拡張機能と Web ページでスタイルが微妙に違う部分の修正

目標としては UI 部分のデバッグがしやすい状態にすることなので、mock は都度追加で良いと思いました。
スタイルに関しては 1px 単位で修正したいなどではなく、コンポーネント実装やボタン等の動作確認程度であれば細かく設定しなくても良いかもしれません。

これで完了です！！
以上で拡張機能の UI 部分を Web ページとして実行してデバッグできるようになったはずです！

#### 最後に

今回は Devin というイケイケな AI Agent と一緒に開発するという貴重な経験ができて楽しかったです。社内で Devin を使いこなすための情報交換が盛んになって、AI を活用できるつよつよ組織になったら更に楽しそうだなと思いました。
