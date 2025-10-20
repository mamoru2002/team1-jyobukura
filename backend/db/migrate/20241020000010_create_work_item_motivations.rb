class CreateWorkItemMotivations < ActiveRecord::Migration[7.1]
  def change
    create_table :work_item_motivations do |t|
      t.references :user, null: false, foreign_key: true
      t.references :work_item, null: false, foreign_key: true
      t.references :motivation_master, null: false, foreign_key: true

      t.timestamp :created_at, null: false
    end

    add_index :work_item_motivations, [:user_id, :work_item_id, :motivation_master_id], unique: true, name: 'index_work_motivations_unique'
  end
end

