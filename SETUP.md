# セットアップガイド

## クイックスタート

```bash
# 1. リポジトリをクローン
git clone <repository-url>
cd team1-jyobukura

# 2. Dockerコンテナをビルド＆起動
docker-compose up --build -d

# 3. ブラウザでアクセス
# フロントエンド: http://localhost:8000
# バックエンドAPI: http://localhost:8001
```

## ポート番号

- **フロントエンド (React)**: 8000
- **バックエンド (Rails API)**: 8001
- **データベース (MySQL)**: 3307

## 初期ユーザー

シードデータで以下のユーザーが作成されています：

- **メール**: demo@example.com
- **名前**: デモユーザー
- **ユーザーID**: 1

## サンプルデータ

### クラフティングマップ (3件)
1. プロジェクトマネジメント (40%)
2. プログラミング (35%)
3. ドキュメント作成 (25%)

### クエスト (3件)
1. **朝のコードレビュー** - 簡単 10XP (連続)
2. **週次レポート作成** - 普通 30XP (連続)
3. **新機能の実装** - 難しい 50XP (単発)

## 開発コマンド

### フォーマッター

```bash
# フロントエンド
docker-compose exec frontend npm run format

# バックエンド
docker-compose exec api bundle exec rubocop -A
```

### データベース操作

```bash
# データベースリセット
docker-compose exec api bundle exec rails db:reset

# コンソール
docker-compose exec api bundle exec rails console

# マイグレーション確認
docker-compose exec api bundle exec rails db:migrate:status
```

### ログ確認

```bash
# すべてのログ
docker-compose logs -f

# APIのみ
docker-compose logs -f api

# フロントエンドのみ
docker-compose logs -f frontend
```

## トラブルシューティング

### ポートが使用されている場合

`docker-compose.yml`のポート番号を変更してください：

```yaml
ports:
  - "他のポート番号:3000"
```

### コンテナが起動しない場合

```bash
# すべてのコンテナとボリュームを削除して再起動
docker-compose down -v
docker-compose up --build -d
```

### データベース接続エラー

```bash
# データベースの状態を確認
docker-compose ps

# データベースが起動していない場合
docker-compose up -d db
```

## VSCode設定

プロジェクトには`.vscode/settings.json`が含まれており、保存時に自動フォーマットされます。

推奨拡張機能（`.vscode/extensions.json`に記載）:
- Prettier - Code formatter
- ESLint
- Ruby LSP
- Ruby Rubocop

拡張機能をインストール後、ファイルを保存するだけで自動的にフォーマットされます。

## 機能の使い方

1. **ブラウザで http://localhost:8000 にアクセス**
2. **STEP 8 (ダッシュボード)** が初期画面として表示されます
3. サイドバーから **STEP 1-7** に移動できます
4. **STEP 7-2** でクエストを追加・編集できます
5. **STEP 8** で「達成！」ボタンを押してXPを獲得できます
6. **100 XP で 1レベルアップ** します

## 次のステップ

- STEP 1-6 の実装を完成させる
- ユーザー認証機能の追加
- データの永続化とローカルストレージ
- レスポンシブデザインの改善

