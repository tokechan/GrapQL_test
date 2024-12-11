# 0からNext.jsとRAGで最新情報特化のチャットボットを作ろう【LangChain/OpenAI】
査読用として手を動かしならが抜け漏れがないかを調べる。
そして、自分の学習に繋げる。

## ChatGPTの前提
利用さているモデルによっていつのデータを学習したのが違う。
gpt-4o   Oct 2023
gpt-3.5-turbo  Sep 2021
というふうに、元データが違うので調べたいときに最新すぎると正しい回答が出てこない！！

## モデル追加して学習することで賢くなる（ファインチューニングという）
再学習には「時間」と「お金」がかかるのでなかなかやれる人はいない。。。。。。
そう考えると、OpenAI社を筆頭にAI関連の開発してる会社は資金力が半端ないんだな。

## RAG（Retrival-Augmented Generation）がこれを打ち壊せる
RAGとはAIモデルが外部データベースや情報源から情報を取得して、それをもとに自然言語生成を行う技術やアプローチのこと。
これにより、最新の情報や特定のドメイン知識を反映した応答を生成することが可能になる。

## RAGについて解説
RAGはAIモデル（ChatGPT）に外部データを渡してそこから答えを導いてもらうアプローチ。と大まかに覚えて良い。
これをすることで、AI自体に文章から答えを導き出せる能力があれば、最新情報を渡して答えを見つけてもらうことで新しい情報を答えさせることができる。
わかりやすい例として、「誰かに自分の代わりに質問の答えを調べてもらう」感じ。
有能すぎる秘書と考えてもいいかもね。
### RAGのメリット
- 再学習が不要
モデルでは対応できない最新情報を使える。学習を再度しなくても回答できる
- 軽量モデルが使える 
最新のモデルでなくても良いので、軽量なモデルを利用することで素早く回答を得ることもできる
- 専門性が高い
外部データを利用することで専門性の高い回答を得ることができる


## 実際のシステムの仕組み
1. 質問をアプリケーションに入力
2. 質問をDBに渡して関連するページのデータを取得(ここでは総理大臣に関連するページ)
3. hatGPTに関連するページのデータをいくつか渡してその中から総理大臣をみつけてもらう

# アプリの設計を考える
1. 関連ページの取り込み
取得したデータをベクトル化という処理をChatGPTに行わせる
    1.ページをクローリングしてデータ取得 
    2.ページをいい感じのまとまりの文章ごとに分割する（パラグラフごとなど）
    3.分割した文章を-1~1で表現する
    4.データベースに文章を保存する
この作業は１度だけでOK。もしデータを最新に更新したい場合は再度DBに更新をかけると良い。
ここでは、簡単なスクリプトでページのクローリング→ベクトル化→DB保存までをやる

2. 質問に類似した文を取得する
次に質問を同じくChatGPTのルールでベクトル化して、その文章に類似した文章をDBから取得する処理を行います。
    1.質問をモデルのルールで-1~1にベクトル化する
    2.ベクトルに対して質問（ベクトル）に近い文章をDBからいくつか取得する
    
3. AIに答えを見つけてもらう
近い文章をいくつかDBから取得したら、DBから取得したデータ（複数）と質問（ベクトル）をAIに渡して答えを文章から見つける。
そうすることで、最新情報を答えてくれるようなチャットbotが出来上がる！

## 関連ページの取り込みスクリプトを作成する
取り込むページのスクレイピング→ベクトル化→DB保存をするためのスクリプト作成

1. Node.jsが入ってるか確認する
```
node -v
```

2. TypeScriptの環境構築
好きなフォルダで下記のコマンドを実行することで今回の開発フォルダを作成
```
$ mkdir rag-chatbot
$ mkdir rag-chatbot/scripts
$ touch rag-chatbot/scripts/main.ts
$ cd rag-chatbot/scripts
```
環境構築
```
$ npm init
// すべてエンター
This utility will walk you through creating a package.json file.
It only covers the most common items, and tries to guess sensible defaults.

See `npm help init` for definitive documentation on these fields
and exactly what they do.

Use `npm install <pkg>` afterwards to install a package and
save it as a dependency in the package.json file.

Press ^C at any time to quit.
package name: (scripts) 
version: (1.0.0) 
description: 
entry point: (index.js) 
test command: 
git repository: 
keywords: 
author: 
license: (ISC) 
About to write to /home/jinwatanabe/workspace/qiit/rag-chatbot/scripts/package.json:

{
  "name": "scripts",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "description": ""
}


Is this OK? (yes) 
```
packge.jsonが作成されるので、下記のコードを追加する。
```
{
  "name": "scripts",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "seed": "./node_modules/.bin/ts-node --project tsconfig.json ./main.ts" // 追加
  },
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "ts-node": "^10.9.2",
    "typescript": "^5.7.2"
  }
}
```
今回はDBにデータを投入するので、seedを追加している

```npm run seed```を実行すると```./node_modules/.bin/ts-node --project tsconfig.json ./main.ts```が裏では実行されます。(このようにすることで長いコマンドを打たなくてもよくなります）

するとmain.ts(TypeScript)をmain.js(JavaScript)に変換してくれます。
Node.jsではJavaScriptを実行できるので変換したものを実行しています。

ここではts-nodeがまだないので、インストールしましょう
```
$ npm install ts-node typescript
```
seedコマンドで```--project tsconfig.json```としているので```tsconfig.json```を用意します。
```
$ npx tsc --init

```
tsconfig.jsonが作成できたら、TypeScriptのファイルを実行してみましょう

main.tsファイルに下記コードを追加
```console.log("Hello World")```

ターミナルでrunして、Hello Worldが表示されればOK
```
$ npm run seed

> scripts@1.0.0 seed
> ./node_modules/.bin/ts-node --project tsconfig.json ./main.ts

Hello World
```
TypeScriptを実行できるようになりました。



3. Wikipediaページを集める




4.  文章をベクトル化する


5. ベクトルをDBに保存する