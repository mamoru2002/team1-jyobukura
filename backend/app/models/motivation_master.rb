class MotivationMaster < ApplicationRecord
  belongs_to :user
  has_many :work_item_motivations, dependent: :destroy
  has_many :work_items, through: :work_item_motivations

  validates :name, presence: true, length: { maximum: 60 }
  validates :name, uniqueness: { scope: :user_id }
end

