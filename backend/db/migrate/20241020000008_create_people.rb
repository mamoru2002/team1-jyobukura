class CreatePeople < ActiveRecord::Migration[7.1]
  def change
    create_table :people do |t|
      t.references :user, null: false, foreign_key: true
      t.string :name, limit: 120, null: false
      t.string :role, limit: 60

      t.timestamps
    end

    add_index :people, [:user_id, :name], unique: true
  end
end

