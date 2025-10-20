# ジョブクラフティング アプリケーション

React + Rails APIで構築されたジョブクラフティングアプリケーション

## 機能

### フロントエンド (React + TypeScript + Vite)
- **STEP 1-6**: ジョブクラフティングマップの作成（元のHTMLデザインを再現）
- **STEP 7-1**: アクションプランの質問入力
- **STEP 7-2**: クエスト管理（追加・編集・削除）
  - 難易度設定（簡単10XP, 普通30XP, 難しい50XP）
  - クエストタイプ（単発・連続）
- **STEP 8**: ダッシュボード（初期画面）
  - クラフティングマップの表示
  - クエストリストの表示
  - 達成ボタンでXP獲得
  - レベルシステム（100XPで1レベルアップ）

### バックエンド (Rails 7.1 API Mode)
- RESTful API
- MySQL データベース
- ユーザー認証準備済み
- レベル・経験値システム

## セットアップ

### 必要なもの
- Docker
- Docker Compose

### 起動方法

```bash
# リポジトリをクローン
git clone <repository-url>
cd team1-jyobukura

# Dockerコンテナをビルド・起動
docker-compose up --build

# 別のターミナルでデータベースのセットアップ（初回のみ）
docker-compose exec api bundle exec rails db:create
docker-compose exec api bundle exec rails db:migrate
docker-compose exec api bundle exec rails db:seed

# アクセス
# フロントエンド: http://localhost:8000
# バックエンドAPI: http://localhost:8001
# データベース: localhost:3307 (MySQLクライアントで接続可能)
```

## 開発環境

### コードフォーマッター

#### フロントエンド（Prettier）
```bash
# コンテナ内で実行
docker-compose exec frontend npm run format

# フォーマットチェック
docker-compose exec frontend npm run format:check
```

#### バックエンド（RuboCop）
```bash
# コンテナ内で実行
docker-compose exec api bundle exec rubocop

# 自動修正
docker-compose exec api bundle exec rubocop -A
```

### VSCode設定
プロジェクトには`.vscode/settings.json`が含まれており、ファイル保存時に自動フォーマットされます。

推奨拡張機能：
- Prettier - Code formatter
- ESLint
- Ruby LSP
- Ruby Rubocop

### 開発時

```bash
# バックエンドのコンソール
docker-compose exec api bundle exec rails console

# データベースのリセット
docker-compose exec api bundle exec rails db:reset

# ログの確認
docker-compose logs -f api
docker-compose logs -f frontend

# フォーマッター実行
docker-compose exec frontend npm run format
docker-compose exec api bundle exec rubocop -A
```

## API エンドポイント

### Users
- `GET /api/v1/users/:id` - ユーザー情報取得
- `GET /api/v1/users/:id/dashboard` - ダッシュボード情報取得
- `POST /api/v1/users` - ユーザー作成
- `PUT /api/v1/users/:id` - ユーザー更新

### Actions (Quests)
- `GET /api/v1/actions?user_id=:user_id` - クエスト一覧取得
- `POST /api/v1/actions` - クエスト作成
- `PUT /api/v1/actions/:id` - クエスト更新
- `DELETE /api/v1/actions/:id` - クエスト削除
- `POST /api/v1/actions/:id/complete` - クエスト達成

### Work Items
- `GET /api/v1/work_items?user_id=:user_id` - 仕事項目一覧取得
- その他のCRUD操作

### その他
- Reflections（省察）
- Action Plans（アクションプラン）
- Motivation Masters（動機マスタ）
- Preference Masters（嗜好マスタ）
- People（関係者）
- Role Categories（役割カテゴリ）

## データベース設計

主要なテーブル:
- `users` - ユーザー情報（レベル、経験値含む）
- `work_items` - 仕事項目（クラフティングマップ）
- `actions` - アクション（タスク・クエスト）
- `reflections` - 省察
- `action_plans` - アクションプラン
- マスタテーブル群
- 中間テーブル群

## 技術スタック

### フロントエンド
- React 18
- TypeScript
- Vite
- React Router
- Axios
- TailwindCSS
- Prettier（フォーマッター）
- ESLint

### バックエンド
- Ruby 3.4.5
- Rails 7.1 (API Mode)
- MySQL 8.4
- Puma
- RuboCop（フォーマッター）

### インフラ
- Docker
- Docker Compose

## コーディング規約

### フロントエンド
- Prettierのデフォルト設定を使用
- シングルクォート推奨
- セミコロンあり
- 行の長さ: 100文字

### バックエンド
- RuboCopのデフォルト設定を使用
- Ruby 3.4の規約に準拠
- 行の長さ: 120文字

## ライセンス

MIT
