class CreateActions < ActiveRecord::Migration[7.1]
  def change
    create_table :actions do |t|
      t.references :user, null: false, foreign_key: true, index: true
      t.string :name, limit: 140, null: false
      t.text :description
      t.date :due_date
      t.string :period_type # 週,月
      t.string :status, default: '未着手', null: false # 未着手,進行中,完了,取下げ
      t.string :action_type, null: false # タスク,クエスト
      t.integer :xp_points, default: 0, null: false
      t.string :difficulty, limit: 20 # easy, medium, hard
      t.string :quest_type, limit: 20 # one_time, recurring
      t.references :work_item, foreign_key: true, index: true

      t.timestamps
    end
  end
end

