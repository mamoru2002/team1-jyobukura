class CreateWorkItems < ActiveRecord::Migration[7.1]
  def change
    create_table :work_items do |t|
      t.references :user, null: false, foreign_key: true, index: true
      t.string :name, limit: 120, null: false
      t.decimal :energy_percentage, precision: 5, scale: 2, null: false
      t.string :reframe, limit: 200

      t.timestamps
    end
  end
end

