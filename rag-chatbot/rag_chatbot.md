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

情報を集めてくるコードを書いていく。
スクレイピングにはLangChainとその裏で使用されエチルPuppeteerというライブラリが必要なので最初にインストールをする。
少し時間がかかるので、Xでも見ながら待つと良い。もしくは記事を読む。
```
$ npm i langchain @langchain/community puppeteer 
```
Wikipediaのページ情報を集めてくるスクリプトはこちらになります。
```
import {
  Browser,
  Page,
  PuppeteerWebBaseLoader,
} from "@langchain/community/document_loaders/web/puppeteer";
const animeData = [
  "https://ja.wikipedia.org/wiki/Category:2024%E5%B9%B4%E3%81%AE%E3%83%86%E3%83%AC%E3%83%93%E3%82%A2%E3%83%8B%E3%83%A1",
  // "https://ja.wikipedia.org/wiki/%E3%80%90%E6%8E%A8%E3%81%97%E3%81%AE%E5%AD%90%E3%80%91_(%E3%82%A2%E3%83%8B%E3%83%A1)",
];

const scrapePage = async () => {
  const pageData = [];
  for await (const url of animeData) {
    const loader = new PuppeteerWebBaseLoader(url, {
      launchOptions: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
      gotoOptions: {
        waitUntil: "domcontentloaded",
      },
      evaluate: async (page: Page, browser: Browser) => {
        const result = await page.evaluate(() => document.body.innerHTML);
        await browser.close();
        return result;
      },
    });

    const data = await loader.scrape();
    pageData.push(data);
  }

  return pageData;
};

(async () => {
  const data = await scrapePage();
  console.log(data);
})();


```
スクレイピングに関しては、animeDataをforで回してlangchainに用意されている機能を利用して行います。

設定は公式ドキュメント通りではありますが、evaluateに実際に取得したページに対して行うことを書いていきます。

ここではページに対してevaluateをすることで取得したページに対してJavaScriptの処理を実行することができます。中ではWebページの document.body.innerHTML（つまり、タグの中身すべて）を取得しています。
```npm run seed```を実行するとページを取得してくる
それらの文章をベクトルにしてをDBに保存する。

Astra DBとChatGPT APIを使用するので、それぞれアカウントを作成する。ChatGPTだけ課金が必要になる。

AstraDBはアカウント作成をしてから以下の手順でDB作成とキーの取得をします。
左メニューから「Database」を選択→「Create Database」をクリック
- Database name : anime_db
- Region : us-east2
に設定して「Creatte Database」をクリック
初期化が始まるのでこちらもしばしばお待ちいただく。

初期化後は「Generate Token」をクリックしてApplication Tokenをコピーして.envにペーストするんだが.envがないので作成する
```touch .env```で作成できるのでルートディレクトリで作成する（今回はscriptがルート）
合わせて今回必要な環境変数も追加する
```
ASTRA_DB_NAMESPACE="default_keyspace"
ASTRA_DB_COLLECTION="anime"
ASTRA_DB_API_ENDPOINT="あなたのエンドポイント"
ASTRA_DB_APPLICATION_TOKEN="あなたのトークン"
```

ChatGPT APIは以下の記事を参考にしてAPIキーを取得してください。
https://excelcamp.jp/ai-bot/media/howto/23133/

APIキーが取得できたら.envに追加します。
```
ASTRA_DB_NAMESPACE="default_keyspace"
ASTRA_DB_COLLECTION="anime"
ASTRA_DB_API_ENDPOINT="あなたのエンドポイント"
ASTRA_DB_APPLICATION_TOKEN="あなたのトークン"
OPENAI_API_KEY="あなたのAPIキー"
```

忘れずに.gitignoreにも追加しておきましょう
かなり大事なことです！間違えてAPIKEYをあげてしまうと大変なことになる！
```touch .gitignore```

```
.env
node_modules
```
ここまででセットアップはすべて完了ですので、実際にWikipediaのページをベクトル化してDBに保存してみましょう


4. 文章をベクトル化する
まずはOpenAIとAstraDBを簡単に利用できるライブラリをインストールします
環境変数も読み込みたいのでdotenvもいれます
```npm i openai @datastax/astra-db-ts dotenv```

インストール後、main.tsのコードを以下のように実装します
```
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import { Page, Browser } from "puppeteer";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import OpenAI from "openai";
import dotenv from "dotenv"; // 追加

dotenv.config(); // 追加

const animeData = [
  "https://ja.wikipedia.org/wiki/Category:2024%E5%B9%B4%E3%81%AE%E3%83%86%E3%83%AC%E3%83%93%E3%82%A2%E3%83%8B%E3%83%A1",
  // "https://ja.wikipedia.org/wiki/%E3%80%90%E6%8E%A8%E3%81%97%E3%81%AE%E5%AD%90%E3%80%91_(%E3%82%A2%E3%83%8B%E3%83%A1)"
];

const scrapePage = async () => {
  const pageData = [];
  for await (const url of animeData) {
    const loader = new PuppeteerWebBaseLoader(url, {
      launchOptions: {
        headless: true,
      },
      gotoOptions: {
        waitUntil: "domcontentloaded",
      },
      evaluate: async (page: Page, browser: Browser) => {
        const result = await page.evaluate(() => document.body.innerHTML);
        await browser.close();
        return result;
      },
    });

    const data = await loader.scrape();
    pageData.push(data);
  }

  return pageData;
};

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  OPENAI_API_KEY,
} = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

const convertVector = async (pageData: string[]) => {
const vectors = [] as number[][];
const chunks = [] as string[];
for (const page of pageData) {
  const pageChunks = await splitter.splitText(page);
  for await (const chunk of pageChunks) {
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: chunk,
      encoding_format: "float",
    });

    const vector = embedding.data[0].embedding;
    console.log(vector);
    vectors.push(vector);
    chunks.push(chunk);
  }
}
return { vectors, chunks };
};

const main = async () => {
  const pageData = await scrapePage();
  await convertVector(pageData);
};

main();
```

まずは環境変数を読み込むための設定と読み込みを行います。
以下は追加した環境変数の設定。
```
import dotenv from "dotenv"; // 追加

dotenv.config(); // 追加

(省略)

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  OPENAI_API_KEY,
} = process.env;
```

次に文章をいい感じのまとまりに切るための準備をします。

```
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});
```

chunkSizeは1つのまとまりの文字数を最大512文字
chunkOverwrapとは他のまとまりと重複を最大100文字許すという意味になります

- 私は昨日の夜に友達とコンビニへ行った

という文章を区切ったときに重複することを許可した場合、例えば以下のようになります

まとまり1: 「私は昨日の夜に...」
まとまり2: 「昨日の夜に友達と...」

このように重複を許可することで情報の流れが途切れてしまうことを防いでいます。

プログラムを実行すると先程のWikipediaのスクレイピングが始まり集めてきたデータをベクトル化する関数に渡します。
```
const main = async () => {
  const pageData = await scrapePage();
  await convertVector(pageData);
};

main();
```
```convertVector```では受け取ったページ1つずつを先程のルールでいい感じのまとまりに分割をしています

```
for (const page of pageData) {
       const chunks = await splitter.splitText(page);
```
そのあと、分割されたまとまりをそれぞれ```openai```のルールで**-1〜1**にするベクトル化をしています。\
```
      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk,
        encoding_format: "float",
      });
```
openaiを利用するための初期化も行っています。
```
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
```
実際に実行するとベクトルが表示されます。
なので、ターミナルで実行します。
```npm run seed```
今回は、ChatGPTアカウント持っていて有料課金していたのでそのまま行けると思ったけどダメだった。
API利用と通常のChatGPT使用は別枠で設けていたので、APIの方に支払いカードの設定が必要だった。
とりあえず、ミニマム料金が$10だったのでそれにして、AutoChargeされないようにチェックボックスを外して設定！ここ重要な気がする。AutoChargeされると無限に金かかりそうなので注意。
気を取り直して、```npm run seed```を実行！
そうするとベクトルがどんどん生成された。

5. ベクトルにDBを保存する
最後に生成したベクトルをD Bni保存します。
以下のように、main.tsファイルを書き直す。
```
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import { Page, Browser } from "puppeteer";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import OpenAI from "openai";
import dotenv from "dotenv";
import { Collection, DataAPIClient } from "@datastax/astra-db-ts";

dotenv.config();

const animeData = [
"https://ja.wikipedia.org/wiki/Category:2024%E5%B9%B4%E3%81%AE%E3%83%86%E3%83%AC%E3%83%93%E3%82%A2%E3%83%8B%E3%83%A1"
"https://ja.wikipedia.org/wiki/%E3%83%88%E3%83%AA%E3%83%AA%E3%82%AA%E3%83%B3%E3%82%B2%E3%83%BC%E3%83%A0",
];

const scrapePage = async () => {
const pageData = [];
for await (const url of animeData) {
  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
    gotoOptions: {
      waitUntil: "domcontentloaded",
    },
    evaluate: async (page: Page, browser: Browser) => {
      const result = await page.evaluate(() => document.body.innerHTML);
      await browser.close();
      return result;
    },
  });

  const data = await loader.scrape();
  pageData.push(data);
}

return pageData;
};

const {
ASTRA_DB_NAMESPACE,
ASTRA_DB_COLLECTION,
ASTRA_DB_API_ENDPOINT,
ASTRA_DB_APPLICATION_TOKEN,
OPENAI_API_KEY,
} = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const splitter = new RecursiveCharacterTextSplitter({
chunkSize: 512,
chunkOverlap: 100,
});

const convertVector = async (pageData: string[]) => {
const vectors = [] as number[][];
const chunks = [] as string[];
for (const page of pageData) {
  const pageChunks = await splitter.splitText(page);
  for await (const chunk of pageChunks) {
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: chunk,
      encoding_format: "float",
    });

    const vector = embedding.data[0].embedding;
    console.log(vector);
    vectors.push(vector);
    chunks.push(chunk);
  }
}
return { vectors, chunks };
};


const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT!, { namespace: ASTRA_DB_NAMESPACE });
const createCollection = async () => {
const res = await db.createCollection(ASTRA_DB_COLLECTION!, {
  vector: {
    dimension: 1536,
    metric: "cosine",
  },
});

console.log(res);
};


const saveVector = async (collection: Collection, chunks: string[], vector: number[][]) => {
for (let i = 0; i < chunks.length; i++) {
  await collection.insertOne({
    $vector: vector[i],
    text: chunks[i],
  });
}
}

const main = async () => {
const pageData = await scrapePage();
const { vectors, chunks } = await convertVector(pageData);

const collection = db.collection(ASTRA_DB_COLLECTION!);

if (vectors && chunks) {
  await createCollection();
  await saveVector(collection, chunks, vectors);
}
};

main();
```
まずAstraDBのクライアントとDBのコネクションを作成する関数を作ります

```
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT!, { namespace: ASTRA_DB_NAMESPACE });
```
この設定をすることでDBに対して操作を行えるようになります。
次にコレクションを作成します。
```
const createCollection = async () => {
  const res = await db.createCollection(ASTRA_DB_COLLECTION!, {
    vector: {
      dimension: 1536,
      metric: "cosine",
    },
  });

  console.log(res);
};
```
コレクションとはテーブルのようなもので、新しいものを作成しています。
コレクションにはベクトルの設定を入れる必要があるので、次元 1536、メトリクス コサイン類似度を設定しました。

ベクトルの形とどのように同じようなベクトル化を判断する方法をしていしたと思ってください。
```
const main = async () => {
  const pageData = await scrapePage();
  const { vectors, chunks } = await convertVector(pageData);

  const collection = db.collection(ASTRA_DB_COLLECTION!);

  if (vectors && chunks) {
    await createCollection();
    await saveVector(collection, chunks, vectors);
  }
};
```
もし先程作成したベクトル、その元となった文章、Astraクライアントを保存関数saveVecotrに渡します。
```
const saveVector = async (collection: Collection, chunks: string[], vector: number[][]) => {
  for (let i = 0; i < chunks.length; i++) {
    await collection.insertOne({
      $vector: vector[i],
      text: chunks[i],
    });
  }
}
```
この関数ではAstaraクライアントを利用してDBに保存をしています。
データの回数だけforを回して保存してきます。ベクトルと文章のペアを保存するのが肝になってきます。このあと質問をベクトル化してDBに投げたときに類似するベクトルと対応する文章を返してもらうためです。

※まだ実行はしないでください この後リファクタリングしたものを実行するためです

今回はわかりやすさを重視してそれぞれの工程を分けましたが本来はメモリを考えるとベクトル化してすぐにデータベースに保存するようにしたほうがよいです。
リファクタリングをしたコードが以下になります。

```
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import { Page, Browser } from "puppeteer";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import OpenAI from "openai";
import dotenv from "dotenv";
import { Collection, DataAPIClient } from "@datastax/astra-db-ts";

dotenv.config();

const animeData = [
  "https://ja.wikipedia.org/wiki/Category:2024%E5%B9%B4%E3%81%AE%E3%83%86%E3%83%AC%E3%83%93%E3%82%A2%E3%83%8B%E3%83%A1",
  "https://ja.wikipedia.org/wiki/%E3%80%90%E6%8E%A8%E3%81%97%E3%81%AE%E5%AD%90%E3%80%91_(%E3%82%A2%E3%83%8B%E3%83%A1)"
];

const scrapePage = async () => {
  const pageData = [];
  for await (const url of animeData) {
    const loader = new PuppeteerWebBaseLoader(url, {
      launchOptions: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
      gotoOptions: {
        waitUntil: "domcontentloaded",
      },
      evaluate: async (page: Page, browser: Browser) => {
        const result = await page.evaluate(() => document.body.innerHTML);
        await browser.close();
        return result;
      },
    });

    const data = await loader.scrape();
    pageData.push(data);
  }

  return pageData;
};

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  OPENAI_API_KEY,
} = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

const convertVectorAndSave = async (pageData: string[]) => {
  for (const page of pageData) {
    const pageChunks = await splitter.splitText(page);
    const collection = await db.collection(ASTRA_DB_COLLECTION!);

    for await (const chunk of pageChunks) {
      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk,
        encoding_format: "float",
      });

      const vector = embedding.data[0].embedding;
      await collection.insertOne({
        $vector: vector,
        text: chunk,
      });
    }
  }
};


const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT!, { namespace: ASTRA_DB_NAMESPACE });
const createCollection = async () => {
  const res = await db.createCollection(ASTRA_DB_COLLECTION!, {
    vector: {
      dimension: 1536,
      metric: "cosine",
    },
  });

  console.log(res);
};

const main = async () => {
  const pageData = await scrapePage();
  await createCollection();
  await convertVectorAndSave(pageData);
};

main();
```
ベクトル化と保存を同時に行うようにしてメモリに残らないようにしました。
それでは実際に実行します。もしanimeDataがコメントになっている場合は戻しましょう
```npm run seed```を実行！
少し時間がかかるので、気長に待ちましょう。
AstraDBを見ると徐々にベクトルが保存されていくのがわかると思います。（animeをクリック）

終わったらデータベースの準備は終了です。Reactでチャットボットを作成しましょう。


## チャットぼっとを開発する
1. Next.jsの環境構築
基本的にはドキュメントどおりに進めていきます。
またディレクトリは先程作成したscriptsの上に作ります

対象のディレクトに移動したら```npx create-next-app@latest```を実行
今回は```client```というプロジェクトを作成する。
TypeScriptとTailwindCSSを入れるようにする。
インストールが終わり次第、サーバーを起動する。

```cd client``` からの```npm run dev```で立ち上がります。

2. チャットボットの画面を作る
clientでもopenaiとastradb`は利用するのでインストールしていきます。
```npm i @ai-sdk/openai @datastax/astra-db-ts ai```
まずは最低限のUIを作ってチャットボットの動きを確かめられるようにしましょう

client/app/page.tsxに以下のコードを記述する
```
"use client";
import { useChat } from "ai/react";

export default function Home() {
  const {
    input,
    messages,
    handleInputChange,
    handleSubmit,
  } = useChat();

  return (
    <div>
      {messages.map((message, index) => (
        <div key={index}>
          <p>{message.content}</p>
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search"
          value={input}
          onChange={handleInputChange}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

まずはHTML部分の解説をしていきます。
ここではAIと私達がやり取りしてきたメッセージの履歴messagesを1つ1つ表示しています
```
      {messages.map((message, index) => (
        <div key={index}>
          <p>{message.content}</p>
        </div>
      ))}
```
messagesはuseChatというライブラリから提供されているhook関数を利用して返却されたmessagesを利用しています。useChatを使うことでチャットボットの実装をより簡単にできます。
```
  const {
    input,
    messages,
    handleInputChange,
    handleSubmit,
  } = useChat();
```
次にフォームの実装を見てきます。

```
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search"
          value={input}
          onChange={handleInputChange}
        />
        <button type="submit">Send</button>
      </form>
```

```<form>タグ```でインプットフォームとボタンを囲んでいます。

インプットフォームで入力されたときに```useChat```で提供されている```handleInputChange```を呼ぶようにしています。これはuseChatで入力されている質問を認識するためです。
```
        <input
          type="text"
          placeholder="Search"
          value={input}
          onChange={handleInputChange}
        />
```
```
  const {
    input,
    messages,
    handleInputChange,
    handleSubmit,
  } = useChat();
```
ボタンはクリックするとsubmitイベントが発火するようになっています。

```<button type="submit">Send</button>```

submitイベントが発火するとformタグのhandleSubmitが実行されます。これもuseChatで提供されているものです。useChatではこの関数が実行されたら現在入力されている質問を使ってAIに問い合わせる処理を勝手にやってくれます。

本来なら入力を受け取ってChatGPTに投げる実装を1からしないといけないのですが、useChatを使うことで簡単にすることができました。

画面は最低限必要なものだけを表示しています。
localhost:3000を開いて実際にUIが変わっているかを確認する
質問をいれて試しに「Send」をクリックしてみましょう
そして、開発ツールでSendがうまくいっているかを調べてみると
右側のネットワークタブで```http//localhost:3000/api/chat```が```404エラー```になったことがわかります。つまりuseChatは質問文を受け取って```http//localhost:3000/api/chat```に投げていることがわかります。
なので、次は```http//localhost:3000/api/chat```でAIに対して問い合わせができるAPIをNext.jsで実装します。

2. Next.jsでAPIを作る
今回ReactではなくNext.jsを使っている理由で特に知ってほしいことを紹介します。
- バックエンドを別に用意しなくてもAPIを作れる　
APIを作るならバックエンド（Express,FastAPI）を別途用意する必要がるがNext.jsだけで作れる
今回は/api/chatのAPIを作る必要がある
- パフォーマンスが良い
Next.jsはサーバサイドで処理することができる
クライアンドサイドで全ての処理をするとユーザのデバイスでの動作が遅くなってしまう原因になる
- セキュリティ面で安全である
サーバー側で処理することでOpenAIのシークレットキーをクライアントに公開せずに使うことができる
環境変数が公開されている状態（NEXT＿PUBLICのPrefixがついている）だと悪用することが可能になってしまうので注意

この中で特に今回重要となるのが「バックエンドを別に用意しなくてもいい」と「セキュリテイ面で安全」です

Reactは基本クライアントサイドで実装することになります。
例えばReactで開発したサイトでは、ネットワークで取得したJavaScriptをみるとシークレットキーが見れることがわかります。
私（渡邊さん）のハンズオンではReactに集中してほしいのと一般公開をする前提ではないので、このようにしていることも多いです。しかし本来はNext.jsやバックエンドを用意してシークレットキーは隠さないといけません。

3. APIを開発する
Next.jsでAPIを開発するのは簡単です。Next.jsではディレクトリ構成がそのままルーティングになっているので、src/apiにディレクトリを作るとその構造がそのままREST APIのパスに対応します。
```mkdir app/api```
```mkdir app/api/chat```
```$ touch app/api/chat/route.ts```
上記のコマンドを実行すると/api/chatのAPIを作ることが可能です。
それでは実際にコードを実装します。

今作成したファイルに以下のコードを記述する。
app/api/chat/route.ts
```
import { DataAPIClient } from "@datastax/astra-db-ts";
import OpenAI from "openai";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  OPENAI_API_KEY,
} = process.env;

const openAIClient = new OpenAI({ apiKey: OPENAI_API_KEY });

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT!, { namespace: ASTRA_DB_NAMESPACE });

export async function POST(req: Request) {
  const { messages } = await req.json();
  const latestMessage = messages[messages.length - 1]?.content;

  let docContext = "";

  const embeddings = await openAIClient.embeddings.create({
    model: "text-embedding-3-small",
    input: latestMessage,
    encoding_format: "float",
  });

  const collection = await db.collection(ASTRA_DB_COLLECTION!);
  const cursor = collection.find(
    {},
    {
      sort: {
        $vector: embeddings.data[0].embedding,
      },
      limit: 10,
    }
  );

  const documents = await cursor.toArray();

  for await (const document of documents) {
    docContext += document.text + " ";
  }

  const template = {
    role: "system",
    content: `
      あなたはアニメについて詳しいです。
      コンテキストで受け取った情報を元に、アニメについての質問に答えることができます。
      これらのコンテキストは最近のWikiページから抽出されました。
      もしない情報がある場合はあなたの情報を使わないでください。
      レスポンスに画像は含めないでください。
      ----------------
      ${docContext}
      ----------------
      Questions: ${latestMessage}
      ----------------

    `,
  };

  const result = await streamText({
    model: openai("gpt-3.5-turbo"),
    prompt: template.content,
  });

  return result.toDataStreamResponse();
}
```

詳しく解説していきます。
まず初めにAPIの雛形はこのようになっています。
```
export async function POST(req: Request) {
}
```
これでPOSTリクエストで/api/chatを叩けるようになります。


次に今回使うOpenAIとAstrDBのクライアントを初期化しておきます。
```
const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  OPENAI_API_KEY,
} = process.env;

const openAIClient = new OpenAI({ apiKey: OPENAI_API_KEY });

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT!, { namespace: ASTRA_DB_NAMESPACE });
```
ここでnext.js側にも.envが必要になるのでコピーしておきます。
現状は新しくフロントとバックをNext.jsで作成しているところです。現環境には.envがまだなくてそれぞれの必要なKEYの情報がないためコピーしていく。
```cp ../scripts/.env ./.env```
個人的にこの基本のコピーコマンドは感動した！！scripts/.envにあるコードをコピーしてclient/.envにペースとしている！！かなり便利だね！ショートカットの極み。

次に、「-1~1のベクトル化をする」箇所の実装を行う。
```
  const { messages } = await req.json();
  const latestMessage = messages[messages.length - 1]?.content;

  let docContext = "";

  const embeddings = await openAIClient.embeddings.create({
    model: "text-embedding-3-small",
    input: latestMessage,
    encoding_format: "float",
  });
```
ここで行なっているのは、POSTで送られてきたメッセージから最新のメッセージ(つまり質問)を取得します。
そのあとにOpenAPIのルールでベクトル化をします。

次に、「類似しているベクトルを取得する」処理を行います。
```
  const collection = await db.collection(ASTRA_DB_COLLECTION!);
  const cursor = collection.find(
    {},
    {
      sort: {
        $vector: embeddings.data[0].embedding,
      },
      limit: 10,
    }
  );

  const documents = await cursor.toArray();

  for await (const document of documents) {
    docContext += document.text + " ";
  }
```
これはAstraDBでクエリ感覚で取得することができるので10件取得しました。
取得したデータにはベクトルと対応するテキストが保存されているので、テキスト部分を1つの文章にまとめる処理をしています。

最後に文章の中から答えを見つけてもらう処理を行います。
```
const template = {
    role: "system",
    content: `
      あなたはアニメについて詳しいです。
      コンテキストで受け取った情報を元に、アニメについての質問に答えることができます。
      これらのコンテキストは最近のWikiページから抽出されました。
      もしない情報がある場合はあなたの情報を使わないでください。
      レスポンスに画像は含めないでください。
      ----------------
      ${docContext}
      ----------------
      Questions: ${latestMessage}
      ----------------

    `,
  };

  const result = await streamText({
    model: openai("gpt-3.5-turbo"),
    prompt: template.content,
  });

  return result.toDataStreamResponse();
```
```streamText```を使ってChatGPTに問い合わせることで、生成されている回答を1文字ずつリアルタイムに取得することができます。こうすることで全部の文章が生成される前に徐々にAPIレスポンスとして返却することができます。

それでは、実際に叩いていきましょう！
```npm run dev```
1文字1文字が正しく返るようになりました。では実際にWeb画面からも実行してみましょう！
ChatGPTに質問したときのように1文字ずつ表示がされました。

## デザインを整えよう
