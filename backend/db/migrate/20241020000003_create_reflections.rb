class CreateReflections < ActiveRecord::Migration[7.1]
  def change
    create_table :reflections do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      t.text :question1_change, null: false
      t.text :question2_emotion_reason, null: false
      t.text :question3_surprise, null: false

      t.timestamps
    end
  end
end

