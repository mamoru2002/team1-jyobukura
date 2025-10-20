class CreateWorkItemRoleCategories < ActiveRecord::Migration[7.1]
  def change
    create_table :work_item_role_categories do |t|
      t.references :user, null: false, foreign_key: true
      t.references :work_item, null: false, foreign_key: true
      t.references :role_category, null: false, foreign_key: true

      t.timestamp :created_at, null: false
    end

    add_index :work_item_role_categories, [:user_id, :work_item_id, :role_category_id], unique: true, name: 'index_work_role_categories_unique'
  end
end

