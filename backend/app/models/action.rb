class Action < ApplicationRecord
  belongs_to :user
  belongs_to :work_item, optional: true

  validates :name, presence: true, length: { maximum: 140 }
  validates :status, presence: true, inclusion: { in: %w[未着手 進行中 完了 取下げ] }
  validates :action_type, presence: true, inclusion: { in: %w[タスク クエスト] }
  validates :xp_points, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :difficulty, inclusion: { in: %w[easy medium hard], allow_nil: true }
  validates :quest_type, inclusion: { in: %w[one_time recurring], allow_nil: true }

  # 難易度に応じたXPポイントを自動設定
  before_validation :set_xp_from_difficulty, if: -> { action_type == 'クエスト' && difficulty.present? }

  def complete!
    update(status: '完了')
    user.add_experience(xp_points) if action_type == 'クエスト'
    
    # 単発クエストの場合は削除
    destroy if quest_type == 'one_time'
  end

  private

  def set_xp_from_difficulty
    self.xp_points = case difficulty
                     when 'easy' then 10
                     when 'medium' then 30
                     when 'hard' then 50
                     else 0
                     end
  end
end

