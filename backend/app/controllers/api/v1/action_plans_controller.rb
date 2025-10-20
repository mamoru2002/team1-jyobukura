module Api
  module V1
    class ActionPlansController < ApplicationController
      before_action :set_action_plan, only: [:show, :update]

      def show
        render json: action_plan_json(@action_plan)
      end

      def create
        user_id = params[:action_plan][:user_id]
        @action_plan = ActionPlan.find_or_initialize_by(user_id: user_id)
        @action_plan.assign_attributes(action_plan_params)

        if @action_plan.save
          render json: action_plan_json(@action_plan), status: :created
        else
          render json: { errors: @action_plan.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @action_plan.update(action_plan_params)
          render json: action_plan_json(@action_plan)
        else
          render json: { errors: @action_plan.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_action_plan
        user_id = params[:id]
        @action_plan = ActionPlan.find_by(user_id: user_id)
        
        if @action_plan.nil?
          render json: { error: 'ActionPlan not found' }, status: :not_found
        end
      end

      def action_plan_params
        params.require(:action_plan).permit(:user_id, :next_actions, :collaborators, :obstacles_and_solutions)
      end

      def action_plan_json(action_plan)
        {
          id: action_plan.id,
          user_id: action_plan.user_id,
          next_actions: action_plan.next_actions,
          collaborators: action_plan.collaborators,
          obstacles_and_solutions: action_plan.obstacles_and_solutions,
          created_at: action_plan.created_at,
          updated_at: action_plan.updated_at
        }
      end
    end
  end
end

