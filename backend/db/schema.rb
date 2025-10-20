# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2024_10_20_000014) do
  create_table "action_plans", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.text "next_actions"
    t.string "collaborators"
    t.text "obstacles_and_solutions"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_action_plans_on_user_id", unique: true
  end

  create_table "actions", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "name", limit: 140, null: false
    t.text "description"
    t.date "due_date"
    t.string "period_type"
    t.string "status", default: "未着手", null: false
    t.string "action_type", null: false
    t.integer "xp_points", default: 0, null: false
    t.string "difficulty", limit: 20
    t.string "quest_type", limit: 20
    t.bigint "work_item_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_actions_on_user_id"
    t.index ["work_item_id"], name: "index_actions_on_work_item_id"
  end

  create_table "motivation_masters", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "name", limit: 60, null: false
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "name"], name: "index_motivation_masters_on_user_id_and_name", unique: true
    t.index ["user_id"], name: "index_motivation_masters_on_user_id"
  end

  create_table "people", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "name", limit: 120, null: false
    t.string "role", limit: 60
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "name"], name: "index_people_on_user_id_and_name", unique: true
    t.index ["user_id"], name: "index_people_on_user_id"
  end

  create_table "preference_masters", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "name", limit: 60, null: false
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "name"], name: "index_preference_masters_on_user_id_and_name", unique: true
    t.index ["user_id"], name: "index_preference_masters_on_user_id"
  end

  create_table "reflections", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.text "question1_change", null: false
    t.text "question2_emotion_reason", null: false
    t.text "question3_surprise", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_reflections_on_user_id", unique: true
  end

  create_table "role_categories", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "name", limit: 60, null: false
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "name"], name: "index_role_categories_on_user_id_and_name", unique: true
    t.index ["user_id"], name: "index_role_categories_on_user_id"
  end

  create_table "user_settings", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "week_start_day", default: "Mon"
    t.integer "month_start_day", default: 1
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_user_settings_on_user_id", unique: true
  end

  create_table "users", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "email", null: false
    t.string "name", limit: 100
    t.string "timezone", limit: 50, default: "Asia/Tokyo"
    t.integer "level", default: 1, null: false
    t.integer "experience_points", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  create_table "work_item_motivations", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "work_item_id", null: false
    t.bigint "motivation_master_id", null: false
    t.timestamp "created_at", null: false
    t.index ["motivation_master_id"], name: "index_work_item_motivations_on_motivation_master_id"
    t.index ["user_id", "work_item_id", "motivation_master_id"], name: "index_work_motivations_unique", unique: true
    t.index ["user_id"], name: "index_work_item_motivations_on_user_id"
    t.index ["work_item_id"], name: "index_work_item_motivations_on_work_item_id"
  end

  create_table "work_item_people", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "work_item_id", null: false
    t.bigint "person_id", null: false
    t.text "improvement_memo"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["person_id"], name: "index_work_item_people_on_person_id"
    t.index ["user_id", "work_item_id", "person_id"], name: "index_work_people_unique", unique: true
    t.index ["user_id"], name: "index_work_item_people_on_user_id"
    t.index ["work_item_id"], name: "index_work_item_people_on_work_item_id"
  end

  create_table "work_item_preferences", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "work_item_id", null: false
    t.bigint "preference_master_id", null: false
    t.timestamp "created_at", null: false
    t.index ["preference_master_id"], name: "index_work_item_preferences_on_preference_master_id"
    t.index ["user_id", "work_item_id", "preference_master_id"], name: "index_work_preferences_unique", unique: true
    t.index ["user_id"], name: "index_work_item_preferences_on_user_id"
    t.index ["work_item_id"], name: "index_work_item_preferences_on_work_item_id"
  end

  create_table "work_item_role_categories", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "work_item_id", null: false
    t.bigint "role_category_id", null: false
    t.timestamp "created_at", null: false
    t.index ["role_category_id"], name: "index_work_item_role_categories_on_role_category_id"
    t.index ["user_id", "work_item_id", "role_category_id"], name: "index_work_role_categories_unique", unique: true
    t.index ["user_id"], name: "index_work_item_role_categories_on_user_id"
    t.index ["work_item_id"], name: "index_work_item_role_categories_on_work_item_id"
  end

  create_table "work_items", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "name", limit: 120, null: false
    t.decimal "energy_percentage", precision: 5, scale: 2, null: false
    t.string "reframe", limit: 200
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_work_items_on_user_id"
  end

  add_foreign_key "action_plans", "users"
  add_foreign_key "actions", "users"
  add_foreign_key "actions", "work_items"
  add_foreign_key "motivation_masters", "users"
  add_foreign_key "people", "users"
  add_foreign_key "preference_masters", "users"
  add_foreign_key "reflections", "users"
  add_foreign_key "role_categories", "users"
  add_foreign_key "user_settings", "users"
  add_foreign_key "work_item_motivations", "motivation_masters"
  add_foreign_key "work_item_motivations", "users"
  add_foreign_key "work_item_motivations", "work_items"
  add_foreign_key "work_item_people", "people"
  add_foreign_key "work_item_people", "users"
  add_foreign_key "work_item_people", "work_items"
  add_foreign_key "work_item_preferences", "preference_masters"
  add_foreign_key "work_item_preferences", "users"
  add_foreign_key "work_item_preferences", "work_items"
  add_foreign_key "work_item_role_categories", "role_categories"
  add_foreign_key "work_item_role_categories", "users"
  add_foreign_key "work_item_role_categories", "work_items"
  add_foreign_key "work_items", "users"
end
