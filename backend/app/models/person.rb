class Person < ApplicationRecord
  belongs_to :user
  has_many :work_item_people, dependent: :destroy
  has_many :work_items, through: :work_item_people

  validates :name, presence: true, length: { maximum: 120 }
  validates :name, uniqueness: { scope: :user_id }
  validates :role, length: { maximum: 60 }
end

