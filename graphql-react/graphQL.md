# GraphQLをマスター

## REST vs GraphQL
まずはREST APIとの比較から、違いを理解しておくことでGraphQLの理解が深まる。

### REST API
/api/user
/api/user/1
/api/user/2
などというリソースがURLで表されるのでURLの識別がらく。
HTTPメソッドでリソースを操作できる

ただ、デメリットとして
- オーバーフェッチの問題
　利用していない画像データ他などが大きなデータ量になり必要のない項目を取得するのに時間がかかってしまう状態。対策は、REST APIのエンドポイントを新たに追加する。（工数がかかってしまう。）

- 異なるエンドポイントを叩くときに大変
　マイクロサービスなどを採用する際によく起きる問題らしい
　例：ニュースに追加情報を入れたい
　ニュースの」発刊元のデータは別のAPIで提供されているから２つ叩いて合わせないといけない。
　そうすると、別APIを２つ叩いてJSONを１つにしてフロントに返す必要がある。
```
/api/news/1
    {
        id: 1,
        title: "news1",
        description: "news1 description",
        publisher_id: 7
    }
```
```
/api/publisher/7
    {
        id: 7,
        name: "pivot",
        logo:"https://pivot.png"
    }
```
これらをを一つにしないといけない
```
{
    title: "news1",
    description: "news1 description",
    name: "pivot",
    logo:"https://pivot.png"    
}
```

### GraphQL
先ほど説明した、REST APIのデメリットを解決するためにGraphQLが生まれた。
GraphQLは、単一のエンドポイントしかない！REST APIとは異なる。
このエンドポイントに対して、クエリを送信することで欲しいデータのみを取得することができる。
ただし、デメリットもあるので注意。

- 学習コストが高い。
- 柔軟な分、セキュリティ面に問題がある
- 画像や動画などのファイルの扱いが難しい

まとめると、レベルが高い技術。
ただし、しっかりと要点を押さえてしまえば、メリットも大きい。

## GraphQLの環境構築を行う

まずはGraphQLを気軽に試せるApollo Clientを0から構築して基本的なクエリを学んでいきます。

Apollo Client はGraphQLのクライアントライブラリの一つであり、最も人気のライブラリの一つ。ReactやVueなどのフロントエンドフレームワークと簡単に統合できる。


```
$ cd graphql-react
$ mkdir graphql-server
$ cd graphql-server
```


## データの永続化をする
ここからはPrismaとSQLiteを使ってデータの永続化を行う。
なぜなら、先ほどつくっったサーバではデータの永続化ができておらずにサーバを再起動するとTODOの状態がリセットされて初期状態に戻ってしまうので。

PrismaはDBとのやりとりを簡単にするルーツ。
ORMとして使用される。
ORMとはDBのデーブルをオブジェクトとして操作できる技術で、SQLを書かなくてもJavaScriptのコードだけでDB操作ができるようになる。
SQLより直感的でわかりやすい！

Prismaを使えば、```prisma.user.create```だけで新しいユーザーをDBに追加することができる。

SQLiteは軽量で組み込み型のRDBでファイルベースのDB
アプリの中でDBをもてるので、外部にサーバを建てる必要がない。
小規模なプロジェクトでよく使用される。

本来はDBを用意するのであれば、AWSなどのクラウドサービスを利用したり、Dockerでコンテナを立てたりコストがかかるが、SQLiteはアプリケーション内に用意でき、ファイルベースとなっているので簡単に利用が可能。

### Prismaのインストール
```
$ npm install prisma --save-dev
$ npx prisma init --datasource-provider sqlite
```

prisma/schema.prismaにモデルを定義する。
```
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db" 
}

model Todo {
  id        String   @id @default(cuid())
  title     String
  completed Boolean
  createdAt DateTime @default(now())
}

```


migrateしてDBに情報を反映させる

```
$ npx prisma migrate dev --name init
```

