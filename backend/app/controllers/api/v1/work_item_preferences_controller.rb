class Api::V1::WorkItemPreferencesController < ApplicationController
  # POST /api/v1/work_item_preferences
  # { work_item_preference: { user_id, work_item_id, preference_master_id } }
  def create
    rec = WorkItemPreference.find_or_create_by!(work_item_preference_params)
    render json: rec, status: :created
  end

  # DELETE /api/v1/work_item_preferences/:id
  def destroy
    WorkItemPreference.find(params[:id]).destroy!
    head :no_content
  end

  private

  def work_item_preference_params
    params.require(:work_item_preference)
          .permit(:user_id, :work_item_id, :preference_master_id)
  end
end
