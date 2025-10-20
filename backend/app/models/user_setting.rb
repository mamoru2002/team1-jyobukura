class UserSetting < ApplicationRecord
  belongs_to :user

  validates :week_start_day, inclusion: { in: %w[Mon Tue Wed Thu Fri Sat Sun] }
  validates :month_start_day, numericality: { only_integer: true, greater_than_or_equal_to: 1, less_than_or_equal_to: 31 }
end

