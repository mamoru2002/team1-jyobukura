class ActionPlan < ApplicationRecord
  belongs_to :user

  validates :next_actions, presence: true
end

