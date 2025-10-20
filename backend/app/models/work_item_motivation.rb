class WorkItemMotivation < ApplicationRecord
  belongs_to :user
  belongs_to :work_item
  belongs_to :motivation_master

  validates :work_item_id, uniqueness: { scope: [:user_id, :motivation_master_id] }
end

