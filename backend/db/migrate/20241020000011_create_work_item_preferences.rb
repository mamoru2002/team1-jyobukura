class CreateWorkItemPreferences < ActiveRecord::Migration[7.1]
  def change
    create_table :work_item_preferences do |t|
      t.references :user, null: false, foreign_key: true
      t.references :work_item, null: false, foreign_key: true
      t.references :preference_master, null: false, foreign_key: true

      t.timestamp :created_at, null: false
    end

    add_index :work_item_preferences, [:user_id, :work_item_id, :preference_master_id], unique: true, name: 'index_work_preferences_unique'
  end
end

