# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# Create a sample user
user = User.find_or_create_by!(email: 'demo@example.com') do |u|
  u.name = 'デモユーザー'
  u.timezone = 'Asia/Tokyo'
  u.level = 1
  u.experience_points = 0
end

puts "✅ Created user: #{user.email}"

# Create sample work items
work_item1 = WorkItem.find_or_create_by!(user: user, name: 'プロジェクトマネジメント') do |wi|
  wi.energy_percentage = 40.0
  wi.reframe = 'チームを成功に導くリーダーシップ'
end

work_item2 = WorkItem.find_or_create_by!(user: user, name: 'プログラミング') do |wi|
  wi.energy_percentage = 35.0
  wi.reframe = '技術で問題を解決するクリエイター'
end

work_item3 = WorkItem.find_or_create_by!(user: user, name: 'ドキュメント作成') do |wi|
  wi.energy_percentage = 25.0
  wi.reframe = '知識を共有する教育者'
end

puts "✅ Created #{WorkItem.count} work items"

# Create sample quests
quest1 = Action.find_or_create_by!(user: user, name: '朝のコードレビュー') do |q|
  q.description = 'チームメンバーのPRをレビューする'
  q.action_type = 'クエスト'
  q.difficulty = 'easy'
  q.quest_type = 'recurring'
  q.xp_points = 10
  q.status = '未着手'
  q.work_item = work_item2
end

quest2 = Action.find_or_create_by!(user: user, name: '週次レポート作成') do |q|
  q.description = 'プロジェクトの進捗をまとめる'
  q.action_type = 'クエスト'
  q.difficulty = 'medium'
  q.quest_type = 'recurring'
  q.xp_points = 30
  q.status = '未着手'
  q.work_item = work_item1
end

quest3 = Action.find_or_create_by!(user: user, name: '新機能の実装') do |q|
  q.description = '複雑な新機能を実装する'
  q.action_type = 'クエスト'
  q.difficulty = 'hard'
  q.quest_type = 'one_time'
  q.xp_points = 50
  q.status = '未着手'
  q.work_item = work_item2
end

puts "✅ Created #{Action.where(action_type: 'クエスト').count} quests"

puts "\n🎉 Seed data created successfully!"
puts "👤 User ID: #{user.id}"
puts "📧 Email: #{user.email}"

motivation_names = %w[
  自由を求める 成長する 楽しさを求める 達成感を得る 権力を求める 安心を得る
  周囲との調和 伝統を守る 影響力を高める 人間性を高める 人を助ける 人を導く
  とにかく実行する 新たなものを創造する
]
preference_names = %w[
  判断力 よく考える 創造性 知恵 専門性 学習力 忍耐力 集中力 誠実さ
  活力 寛大さ 社交性 趣味のよさ 楽観性 ユーモア ものごとを整理する
]

motivation_names.each do |n|
  MotivationMaster.find_or_create_by!(user: user, name: n)
end
preference_names.each do |n|
  PreferenceMaster.find_or_create_by!(user: user, name: n)
end

puts "✅ Masters seeded for user=#{user.id}: motivations=#{user.motivation_masters.count}, preferences=#{user.preference_masters.count}"
