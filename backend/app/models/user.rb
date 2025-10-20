class User < ApplicationRecord
  has_many :work_items, dependent: :destroy
  has_one :reflection, dependent: :destroy
  has_many :actions, dependent: :destroy
  has_one :user_setting, dependent: :destroy
  has_one :action_plan, dependent: :destroy
  has_many :motivation_masters, dependent: :destroy
  has_many :preference_masters, dependent: :destroy
  has_many :people, dependent: :destroy
  has_many :role_categories, dependent: :destroy

  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :timezone, presence: true
  validates :level, numericality: { only_integer: true, greater_than_or_equal_to: 1 }
  validates :experience_points, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  # レベルアップのロジック
  def add_experience(xp)
    self.experience_points += xp
    level_up_count = self.experience_points / 100
    self.level = 1 + level_up_count
    self.experience_points = self.experience_points % 100
    save
  end

  # 次のレベルまでの経験値
  def xp_to_next_level
    100 - experience_points
  end

  # レベルゲージのパーセンテージ
  def xp_percentage
    (experience_points.to_f / 100 * 100).round
  end
end

