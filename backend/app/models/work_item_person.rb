class WorkItemPerson < ApplicationRecord
  belongs_to :user
  belongs_to :work_item
  belongs_to :person

  validates :work_item_id, uniqueness: { scope: [:user_id, :person_id] }
end

