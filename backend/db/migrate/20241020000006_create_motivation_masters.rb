class CreateMotivationMasters < ActiveRecord::Migration[7.1]
  def change
    create_table :motivation_masters do |t|
      t.references :user, null: false, foreign_key: true
      t.string :name, limit: 60, null: false
      t.text :description

      t.timestamps
    end

    add_index :motivation_masters, [:user_id, :name], unique: true
  end
end

