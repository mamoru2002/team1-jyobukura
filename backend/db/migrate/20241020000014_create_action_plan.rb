class CreateActionPlan < ActiveRecord::Migration[7.1]
  def change
    create_table :action_plans do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      t.text :next_actions
      t.string :collaborators, limit: 255
      t.text :obstacles_and_solutions

      t.timestamps
    end
  end
end

