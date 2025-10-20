class WorkItemRoleCategory < ApplicationRecord
  belongs_to :user
  belongs_to :work_item
  belongs_to :role_category

  validates :work_item_id, uniqueness: { scope: [:user_id, :role_category_id] }
end

