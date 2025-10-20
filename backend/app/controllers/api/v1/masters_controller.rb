# frozen_string_literal: true

class Api::V1::MastersController < ApplicationController
  before_action :set_user

  # GET /api/v1/masters/motivations?user_id=1
  def motivations
    # 共有（user_id: NULL）＋ ユーザー固有（user_id: @user.id）
    scope = MotivationMaster.where(user_id: [nil, @user.id]).order(:id)
    render json: scope.select(:id, :name, :description)
  end

  # GET /api/v1/masters/preferences?user_id=1
  def preferences
    scope = PreferenceMaster.where(user_id: [nil, @user.id]).order(:id)
    render json: scope.select(:id, :name, :description)
  end

  private

  def set_user
    @user = User.find(params[:user_id] || params[:uid] || params[:id] || 1) # デモ用: なければ1
  end
end
