class CreateUserSettings < ActiveRecord::Migration[7.1]
  def change
    create_table :user_settings do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      t.string :week_start_day, default: 'Mon'
      t.integer :month_start_day, default: 1

      t.timestamps
    end
  end
end

