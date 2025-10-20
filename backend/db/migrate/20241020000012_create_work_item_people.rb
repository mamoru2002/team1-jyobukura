class CreateWorkItemPeople < ActiveRecord::Migration[7.1]
  def change
    create_table :work_item_people do |t|
      t.references :user, null: false, foreign_key: true
      t.references :work_item, null: false, foreign_key: true
      t.references :person, null: false, foreign_key: true
      t.text :improvement_memo

      t.timestamps
    end

    add_index :work_item_people, [:user_id, :work_item_id, :person_id], unique: true, name: 'index_work_people_unique'
  end
end

