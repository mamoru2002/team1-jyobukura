class WorkItem < ApplicationRecord
  belongs_to :user
  has_many :work_item_motivations, dependent: :destroy
  has_many :motivation_masters, through: :work_item_motivations
  has_many :work_item_preferences, dependent: :destroy
  has_many :preference_masters, through: :work_item_preferences
  has_many :work_item_people, dependent: :destroy
  has_many :people, through: :work_item_people
  has_many :work_item_role_categories, dependent: :destroy
  has_many :role_categories, through: :work_item_role_categories
  has_many :actions, dependent: :nullify

  validates :name, presence: true, length: { maximum: 120 }
  validates :energy_percentage, presence: true, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100 }
  validates :reframe, length: { maximum: 200 }
end

