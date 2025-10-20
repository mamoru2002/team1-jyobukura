class Api::V1::WorkItemMotivationsController < ApplicationController
  # POST /api/v1/work_item_motivations
  # { work_item_motivation: { user_id, work_item_id, motivation_master_id } }
  def create
    rec = WorkItemMotivation.find_or_create_by!(work_item_motivation_params)
    render json: rec, status: :created
  end

  # DELETE /api/v1/work_item_motivations/:id
  def destroy
    WorkItemMotivation.find(params[:id]).destroy!
    head :no_content
  end

  private

  def work_item_motivation_params
    params.require(:work_item_motivation)
          .permit(:user_id, :work_item_id, :motivation_master_id)
  end
end
