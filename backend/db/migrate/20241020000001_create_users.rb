class CreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users do |t|
      t.string :email, limit: 255, null: false
      t.string :name, limit: 100
      t.string :timezone, limit: 50, default: 'Asia/Tokyo'
      t.integer :level, default: 1, null: false
      t.integer :experience_points, default: 0, null: false

      t.timestamps
    end

    add_index :users, :email, unique: true
  end
end

