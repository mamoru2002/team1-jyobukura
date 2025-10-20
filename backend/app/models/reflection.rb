class Reflection < ApplicationRecord
  belongs_to :user

  validates :question1_change, presence: true
  validates :question2_emotion_reason, presence: true
  validates :question3_surprise, presence: true
end

