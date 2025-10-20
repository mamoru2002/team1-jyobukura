class WorkItemPreference < ApplicationRecord
  belongs_to :user
  belongs_to :work_item
  belongs_to :preference_master

  validates :work_item_id, uniqueness: { scope: [:user_id, :preference_master_id] }
end

