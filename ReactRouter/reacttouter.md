# React Router 19 is now stabel!
ついにReact 19が安定版としてリリース！
React19になってSSRなどサーバーコンポーネントが完全にサポート
そこで真っ先に動いたのがRemix
Reactでサーバーでの処理ができるとなると「React + React Router」と「React + Remix + React Router」で実現できることの差がなくなりました。

そこでReact RouterとRemixが統合されて新たなフレームワークが生まれます。
それが「React Router v7」の登場！

そんな話題のフルスタックフレームワークとなったReact Router v7を使って技術記事アプリを作っていくインプットしてからの課題でアウトプット！
React Routerを使うメリットはRemixのメリットを享受できることです。今回はRemixの機能を中心にReact Routerを使ってアプリを開発

1. React Routerの進化
ReactRouter　v７とは？
React19でRemix+ReactRouterとの差がなくなったのでRemixを統合して誕生
ライブラリからフルスタックフルスタックフレームワークへと進化した

新しくなったReactRouterv7は「ReactRouterv6」に「Remix」を統合して誕生しました

ReactRouterv7は今までどおり「ルーティングライブラリ」としても利用することもできます。
そしてフレームワークとしても使うこともできます。


ReactRouterv7のフレームワークは以下の点で進化を遂げました。

- コンフィグベースのルーティング
- 型安全の向上
- CSR/SSR/SSGのレンダリング
- データローディング

ここでCSRやSSRが理解できない人もいるかと思いますので解説していきます。

## クライアントサイドレンダリング(CSR)
クライアントサイドレンダリングはReactのコードをクライアント(あなたのブラウザ)で処理してHTMLのファイルを生成するレンダリング方式のことを指します。
Reactはフレームワークを利用しない場合は基本クライアントサイドでレンダリングが行われていました。
## サーバーサイドレンダリング(SSR)
Reactをサーバー側で処理をしてHTMLを生成して完成したものをクライアントに返して表示するレンダリング方法になります。
Next.jsを利用するのはこのサーバー側での処理を行えるというのが大きいです。
例えば1つの画面の中でも「記事一覧」の部分は記事取得のためにAPIを叩く必要があるので、その部分のコンポーネントだけをサーバーコンポーネントとしてサーバー側で処理することも可能です。(クライアントで処理されるコンポーネントはクライアントコンポーネントといいます)
## SSG(Static Site Generation)
SSRに似ているのですが、ビルド時に1度だけしかHTMLを生成しないという特徴があります。
アクセスするたびにサーバー側でAPIを叩く必要がなくなるので、素早くHTMLを返すことができます。(必要なタイミングでSSRをするISRがありますがこれはまだ対応指定なさそう)


## メリットデメリットはそれぞれありますが、SSRができるようにReactにフレームワークを追加しておくことは大切なのです。
それぞれのユースケースを簡単に紹介すると
CSR : ダッシュボード系アプリ、オンラインエディタなどインタラクティブなもの
SSR : SNSプラットフォーム、ニュースサイト
SSG : 公式ドキュメント、会社のホームページなど更新が少ないもの

クライアント側だけでアプリを作る場合、例えばChatGPTを叩くときに使うシークレットキーを使っていたとしたらブラウザから簡単に見ることができてしまいます。これを使われてしまうと莫大な請求につながるかもしれません

##　Remixがイケてる理由
1. Web標準　　キャッチアップのコストが少ない　知識が陳腐化しずらい
Web標準に従っているためキャッチアップのコストが少なく、学んだ知識が時代によって使えなくなるリスクが少ないです。フロントエンドは移りセキュリティ面でもサーバーサイドで処理をすることは大切です。変わりが激しいからこそ長期的に考えてRemix(ReactRouter)を選択することが今後は多くなると考えています。
2. 状態管理が不要」データをサーバで管理してクライアントはあくまで表示する仕組み　データが更新されると自動的にデータがリフレッシュされて反映される
RemixはReactで使われるuseStateなどのクライアントステートを最小限に抑えられるメリットがあります。
例えばTODOのタイトルを更新したとします。Remixでは更新をしたらサーバー側で更新処理を行います。更新処理ではDBにある該当TODOのタイトルを実際に更新しています。その後、最新データの取得をRemixは行います。そしてサーバー側で最新状態のHTMLをレンダリングしてクライアントに返し画面を反映させます。

このようにRemixを利用することでクライアント側とサーバー側の両方でデータ管理をする必要がないです。故にデータがずれたりするバグもなくすことが可能です。
3. ReactRouterと統合　Remixでデメリットとして挙げられていたルーティング周りが統合により改善
Remixの欠点として挙げられていたのが「型が弱い」「ルーティングが大変」ということでした。しかし、ReactRouterとの統合によって大幅に改善しています。

## Next.jsとRemixの比較
Next.jsとRemixを比較すると、それぞれに異なる特徴があり、プロジェクトの要件に応じて選択を検討する必要があります。

Next.jsは多機能で強力なフレームワークですが、それゆえに以下のような課題があります。
設定の複雑:App RouterやPage Router、様々なレンダリング戦略（SSG、SSR、ISR）など、多くの選択肢と設定項目があり、適切な選択と設定に時間がかかることがある
バンドルサイズの増大:組み込まれている多くの機能により、必要としない機能もバンドルに含まれる可能性があり、初期ロード時間に影響を与えることがある
学習コストが高い：チーム全体が習得するまでに時間がかかる場合がある

フレームワークの選択は、プロジェクトの具体的な要件や開発チームの特性を考慮して行うことが重要です。


2. ルーティングの基本
まずは、ReactRouterv７で導入されたコンフィグベースのルーティングを理解しましょう。
これは、設定ファイルでルーティングを一括管理できる方式です。

以前のようなルーティング↓
```
import { Routes, Route } from "react-router";

function Wizard() {
  return (
    <div>
      <h1>Some Wizard with Steps</h1>
      <Routes>
        <Route index element={<StepOne />} />
        <Route path="step-2" element={<StepTwo />} />
        <Route path="step-3" element={<StepThree />}>
      </Routes>
    </div>
  );
}
```

3. 環境構築
React Routerの環境構築からしていきましょう。
ここでの注意点はライブラリとしてのReactRouter(ルーティングのみ)を使うか、フレームワークとしてのReactRouter(Remixあり)を使うかで方法が変わってきます

今回はフレームワークとして利用するので以下のコマンドを実行
```npx create-react-router@latest router-article-app```
全てYesを選択する
環境ができたら起動していく
``` cd router-article-app```
```npm run dev ```
localhost:5173にアクセスしてReactRouterの画面が出ていれば成功！
好みのエディタでコードを書いていきましょう。
開き方は、フォルダからでもいいし、ターミナルコマンドからでも好きな方法で

4. ルーティングを設定する
先にコンフィグベースのルーティングで出てくる主要な概念について説明

- route：特定のURLと表示するコンポーネントを紐付けます
- layout：複数のページで共通して使用するレイアウト（ヘッダーやサイドバーなど）を定義します
- prefix：URLの前に共通の文字列をつけることができます（例：/admin/... のような管理者用ページ）
- Outlet：layoutで定義した共通部分の中に、各ページの内容を表示する場所を指定します

それでは実際にルーティングを設定してみましょう
```app/routes```にルーティングの設定が書かれています。
app/routes.ts
```
import { type RouteConfig, index } from "@react-router/dev/routes";

export default [index("routes/home.tsx")] satisfies RouteConfig;

```
```index("route/home.tsx")```とあります。これは```localhost:5173```を開くと```routes/home.tsx```が表示されることを表しています。

ためしに```home.t   sx```を以下に修正して```localhost:5173```にアクセスしてみましょう。(```npm run dev```でサーバーを起動しましょう)
app/routes/home.tsx
```
export default function Home() {
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  );
}
```
問題なくHello Worldが出るはずです
```index```に書くことで```/```に紐付けることができます。CSSはこのあとサイドメニューを入れる関係で事前に当てています。

では次に以下のように```routes.ts```を修正してください。
app/routes.ts
```
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("popular", "routes/popular.tsx"),
] satisfies RouteConfig;
```

次に```app/routes/popular.tsx```を作成してください。
```touch app/routes/popular.tsx```

app/routes/popular.tsx
```
export default function Popular() {
  return (
    <div>
      <h1>Popular</h1>
    </div>
  );
}
```

```localhost:5173/popular```にアクセスしてみてください。
```route("popular", "routes/popular.tsx")```とすることで```/popular```に```popular.tsx```を紐付けました。

続いて以下のようなルーティングを追加します。

app/routes.ts
```
import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("layouts/sidemenu.tsx", [
    index("routes/home.tsx"),
    route("popular", "routes/popular.tsx"),
    route("search", "routes/search.tsx"),
  ]),
] satisfies RouteConfig;
```
必要なコンポーネントを作成しましょう

```touch app/routes/search.tsx```
```mkdir app/layouts```
```touch app/layouts/sidemenu.tsx```

app/routes/search.tsx
```
export default function Search() {
  return (
    <div>
      <div className="flex-1 sm:ml-64">
        <h1>記事検索</h1>
      </div>
    </div>
  );
}
```
/app/layouts/sidemenu.tsx
```
import { Link, Outlet } from "react-router";

export default function Header() {
  const menuItems = [
    { name: "記事一覧", path: "/" },
    { name: "人気記事", path: "/popular" },
    { name: "検索", path: "/search" },
  ];

  return (
    <div>
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 bg-white shadow-lg`}
      >
        <div>
          <div>
            <nav>
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </aside>
      <Outlet />
    </div>
  );
}
```
画面を開いて```/search```を開くと新しいページができています。
左のメニューをクリックすると画面が切り替わります。

ここではOutletを利用しています。この部分にルーティングされたコンポーネントが埋め込まれます。
```
  layout("layouts/sidemenu.tsx", [
    index("routes/home.tsx"),
    route("popular", "routes/popular.tsx"),
    route("search", "routes/search.tsx"),
  ]),
```
先程のルーティングはこのような設定になっており、文字通りレイアウトを利用することができます。
```sidemenu.tsx``の```<Outlet />```の部分に埋め込まれます。
例えば/searchであればの部分にroutes/search.tsxが埋め込まれています。

最後に```Prefix```を使ってみます
app/routes.ts
```
import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  layout("layouts/sidemenu.tsx", [
    index("routes/home.tsx"),
    route("popular", "routes/popular.tsx"),
    route("search", "routes/search.tsx"),
  ]),
  ...prefix("v1", [...prefix("systems", [route("ping", "routes/ping.tsx")])]),
] satisfies RouteConfig;
```
```touch app/routes/ping.tsx```
app/routes/ping.tsx
```
export default function Ping() {
  return (
    <div>
        <h1>Ping</h1>
    </div>
        );
}
```

そして```localhost:5173/v1/systems/ping```を開くとPingが表示されます。
```...prefix("v1", [...prefix("systems", [route("ping", "routes/ping.tsx")])])```
このようにPrefixを利用することでURLの前に共通の文字列をつけることができます。
書くことでパスをネストすることができる。
今回は```v1/systems```とネストしてから先ほど説明した```route```を使いました。
ここまででReact Routerのルーティング機能については理解できたと思います！！
次は、Remixが持っていた機能を使っていきます。


5. 技術記事アプリを作る
今回は技術記事アプリを作ります

記事一覧 : SSRで実装
人気記事一覧 : SSGで実装
記事検索 : CSRで実装

ページを作りながらそれぞれの特徴を活かしてレンダリングを学んでいきます。

6. 記事一覧ページの実装
記事一覧ページはSSRで実装していきます。
今回はQiitaのAPIを活用していきます。Qiita APIは認証情報を利用するためクライアント側で処理すると認証情報が公開されてしまうと悪用のリスクがあります。

必要なファイルを作成します。
```mkdir app/domain```
```touch app/domain/Article.tsx```

app/domain/Article.tsx
```
export class Article {
  constructor(
    public title: string,
    public url: string,
    public like_count: number,
    public stocks_count: number,
    public published_at: string
  ) {}
}

type Tag = {
  name: string;
  versions: string[];
};

type User = {
  description: string;
  facebook_id: string;
  followees_count: number;
  followers_count: number;
  github_login_name: string;
  id: string;
  items_count: number;
  linkedin_id: string;
  location: string;
  name: string;
  organization: string;
  permanent_id: number;
  profile_image_url: string;
  team_only: boolean;
  twitter_screen_name: string;
  website_url: string;
};

type Group = {
  created_at: string;
  description: string;
  name: string;
  private: boolean;
  updated_at: string;
  url_name: string;
};

type TeamMembership = {
  name: string;
};

export type ArticleJson = {
  rendered_body: string;
  body: string;
  coediting: boolean;
  comments_count: number;
  created_at: string;
  group: Group;
  id: string;
  likes_count: number;
  private: boolean;
  reactions_count: number;
  stocks_count: number;
  tags: Tag[];
  title: string;
  updated_at: string;
  url: string;
  user: User;
  page_views_count: number;
  team_membership: TeamMembership;
  organization_url_name: string;
  slide: boolean;
};
```
まずはTypeScriptを書きやすくするためにドメインを用意しました。
このように型を定義しておくことでVSCodeで強力な補完が利用できたり、存在しない項目を使おうとするとエラーになったりと間違いを防ぐことができます。

typeArticleJson, TeamMembership, Group, User, Tagは今回利用するAPIから返却されるJSONの形を表現したものです。

```https://qiita.com/api/v2/docs#%E6%8A%95%E7%A8%BC```

Articleは実際に今回利用するドメインでページ表示に必要な項目だけを設定しています。
```
export class Article {
  constructor(
    public title: string,
    public url: string,
    public like_count: number,
    public stocks_count: number,
    public published_at: string
  ) {}
}
```
次ににQiitaからAPI利用するための認証情報を取得しましょう！
Qiita(website)を開いて「設定」→「アプリケーション」から「個人用アクセストークン」の「新しくトークンを発行する」をクリックします。
　
「アクセストークンの説明」にreact-router-appと入力して「発行する」をクリック

アクセストークンが表示されるのでメモしておきましょう。

それでは実際に記事一覧ページを作成します。
まずはCSRとSSRの違いを体感するためにCSRで実装をしてみます。

```
import type { Route } from "./+types/home";
import { Article, type ArticleJson } from "~/domain/Article";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const res = await fetch(`https://qiita.com/api/v2/authenticated_user/items`, {
    headers: {
      Authorization: `Bearer [あなたのアクセストークンを入れる]`,
    },
  });
  const articlesJson: ArticleJson[] = await res.json();
  const articles = articlesJson.map(
    (articleJson) =>
      new Article(
        articleJson.title,
        articleJson.url,
        articleJson.likes_count,
        articleJson.stocks_count,
        articleJson.created_at
      )
  );

  return { articles };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { articles } = loaderData;
  return (
    <div className="flex-1 sm:ml-64">
      <h1>記事一覧</h1>
      <div className="container mx-auto px-4 py-8">
        {articles.map((article) => (
          <p key={article.url}>{article.title}</p>
        ))}
      </div>
    </div>
  );
}
```

まず最初にページにアクセスしたらQiitaから記事を取得する処理です。
ここではReact Router(Remix)のData Loaderを使ってデータ取得を事前に行っています。
```
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  (省略)
}
```
Data Loaderを利用することは多くのメリットがあります。

- ページ表示前にデータ取得を行える
- Loading状態を自動で管理してくれる
- エラーハンドリングが簡単
- 型の安全性がある

今回は事前にデータを取得するために利用しています。
clientLoaderに処理を書くことでHTMLに必要な記事のデータをクライアントサイドで事前にロードしています。つまりCSRの動きをしています。Reactをやったことがある方であれば、事前にデータ取得をする動きはuseEffectの代わりとイメージするとわかりやすいかと思います。
```params```は 今回利用していませんが、例えば```/users/1```みたいなパスでUserIdを取るときに利用できます。

実際にfetchをしてQiitaの記事を取得しているのが以下の部分です。
```
  const res = await fetch(`https://qiita.com/api/v2/authenticated_user/items`, {
    headers: {
      Authorization: `Bearer [あなたのアクセストークンを入れる]`,
    },
  });
  const articlesJson: ArticleJson[] = await res.json();
```
今回はhttps://qiita.com/api/v2/authenticated_user/itemsを叩いています。このエンドポイントはアクセストークンのユーザーつまりあなたの記事を取得することができます。(もし記事が1つもない場合は何か限定公開記事を投稿しましょう)

そのあとに取得したデータを私達が今回利用するドメイン(Article)にしてあげて返しています。

```
  const articles = articlesJson.map(
    (articleJson) =>
      new Article(
        articleJson.title,
        articleJson.url,
        articleJson.likes_count,
        articleJson.stocks_count,
        articleJson.created_at
      )
  );

  return { articles };
```
Data Loaderで返した値は簡単に受け取ることができます。

```
  const { articles } = loaderData;
```
なんとartcilesはData Loaderで返した型(Article[])をしっかりと推論までしてくれます。

そのあとはarticlesをmapで回してHTMLに表示しています。

```
  return (
    <div className="flex-1 sm:ml-64">
      <h1>記事一覧</h1>
      <div className="container mx-auto px-4 py-8">
        {articles.map((article) => (
          <p key={article.url}>{article.title}</p>
        ))}
      </div>
    </div>
  );
``` 
それでは実際に画面を見てみましょう！
なんと、記事が表示されました。しかしとある問題があります。。。

開発者ツールで「Network」から「home.tsx」をみるとアクセストークンをクライアント側で見ることができていしまいます。
これではセキュリティ上の問題があります。

そこでSSRで実装していきます。
アクセストークンなどがあるケースではセキュリティ面でSSRを選択する必要があります。
またSSRにしておくことでパフォーマンスやSEOなど色々とメリットがあるので、Loaderの設定をかえてSSRでデータ取得をできるようにしてみましょう。

app/routes.home.tsx
```
import type { Route } from "./+types/home";
import { Article, type ArticleJson } from "~/domain/Article";

export async function loader({ params }: Route.LoaderArgs) {
  const res = await fetch(`https://qiita.com/api/v2/authenticated_user/items`, {
    headers: {
      Authorization: `Bearer [あなたのアクセストークンを入れる]`,
    },
  });
  const articlesJson: ArticleJson[] = await res.json();
  const articles = articlesJson.map(
    (articleJson) =>
      new Article(
        articleJson.title,
        articleJson.url,
        articleJson.likes_count,
        articleJson.stocks_count,
        articleJson.created_at
      )
  );

  return { articles };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { articles } = loaderData;
  return (
    <div className="flex-1 sm:ml-64">
      <h1>記事一覧</h1>
      <div className="container mx-auto px-4 py-8">
        {articles.map((article) => (
          <p key={article.url}>{article.title}</p>
        ))}
      </div>
    </div>
  );
}
```
CSRからSSRに変えるのはものすごく簡単です。

```
export async function loader({ params }: Route.LoaderArgs) {
  (省略)
}
```
このように```export async function loader```を追加するだけです。
```
export async function loader({ params }: Route.LoaderArgs) {
  (省略)
}
```

```clientLoader``` -> ```loader```
```Route.LoaderArgs``` -> ```Route.LoaderArgs```    
と変わっただけです。

それでは実際に画面でアクセストークンが表示されてないかを見てみましょう！
ブラウザで開発者ツールを開いて「Network」から「home.tsx」をみるとアクセストークンが表示されていないことがわかります。

これにて、アクセストークンを検索しても見つかりませんでした！無事SSRができています。

7. 人気記事一覧ページの実装
それでは次に人気記事一覧ページを作成していきます。人気記事のようなものは頻繁の更新が不要なのでSSGをするのには向いているページです。実際にSSGを使ってページを作成してみましょう。
まずはSSGのページであることを```react-router.config.ts```に設定します。
react-router.config.ts
```
import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  async prerender() {
    return ["/popular"];
  },
} satisfies Config;
```
```async prerender```の中にページのパスを指定することでSSG設定は完了です。
実際のページはSSRのときとほとんど実装は変わりません。
ただし今回の記事取得は```https://qiita.com/api/v2/items?page=1&per_page=20&query=user%3ASicut_study```を叩いています。

これは@Sicut_study(渡邊さん)の記事を1ページ目から20件取得するクエリとなっています。
APIではクエリが色々ありますのでそれぞれでカスタマイズしていただいても大丈夫です。
app/routes/popular.tsx
```
import type { Route } from "./+types/home";
import { Article, type ArticleJson } from "~/domain/Article";

export async function loader({ params }: Route.LoaderArgs) {
  const res = await fetch(
    `https://qiita.com/api/v2/items?page=1&per_page=20&query=user%3ASicut_study`,
    {
      headers: {
        Authorization: `Bearer [あなたのアクセストークンを入れる]`,
      },
    }
  );
  const articlesJson: ArticleJson[] = await res.json();
  const articles = articlesJson.map(
    (articleJson) =>
      new Article(
        articleJson.title,
        articleJson.url,
        articleJson.likes_count,
        articleJson.stocks_count,
        articleJson.created_at
      )
  );

  return { articles };
}

export default function Popular({ loaderData }: Route.ComponentProps) {
  const { articles } = loaderData;
  return (
    <div className="flex-1 sm:ml-64">
      <h1>人気記事一覧</h1>
      <div className="container mx-auto px-4 py-8">
        {articles.map((article) => (
          <p key={article.url}>{article.title}</p>
        ))}
      </div>
    </div>
  );
}
```
そしてSSGをするにはビルドをする必要があります。
```npm run build```

そのあとに```npm run preview```or ```npm run start```でビルドしたページを確認してみましょう！

```localhost:3000/popular```にアクセスします。
SSGで表示することができました。SSGなのでリロードしても高速で表示されるので試してみてください。


test desu
