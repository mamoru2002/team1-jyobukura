module Api
  module V1
    class ActionsController < ApplicationController
      before_action :set_action, only: [:show, :update, :destroy, :complete]

      def index
        user_id = params[:user_id]
        if user_id
          actions = Action.where(user_id: user_id).order(created_at: :desc)
          render json: actions.map { |a| action_json(a) }
        else
          render json: { error: 'user_id is required' }, status: :bad_request
        end
      end

      def show
        render json: action_json(@action)
      end

      def create
        @action = Action.new(action_params)

        if @action.save
          render json: action_json(@action), status: :created
        else
          render json: { errors: @action.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @action.update(action_params)
          render json: action_json(@action)
        else
          render json: { errors: @action.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @action.destroy
        head :no_content
      end

      def complete
        @action.complete!
        
        if @action.destroyed?
          # 単発クエストの場合は削除されている
          render json: { 
            message: 'Quest completed and removed',
            xp_gained: action_params_for_complete[:xp_points] || @action.xp_points,
            user: user_json(@action.user)
          }
        else
          # 連続クエストの場合は残っている
          render json: { 
            message: 'Quest completed',
            action: action_json(@action),
            xp_gained: @action.xp_points,
            user: user_json(@action.user)
          }
        end
      end

      private

      def set_action
        @action = Action.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Action not found' }, status: :not_found
      end

      def action_params
        params.require(:action).permit(
          :user_id, :name, :description, :due_date, :period_type, 
          :status, :action_type, :xp_points, :difficulty, :quest_type, :work_item_id
        )
      end

      def action_params_for_complete
        params.permit(:xp_points)
      end

      def action_json(action)
        {
          id: action.id,
          name: action.name,
          description: action.description,
          due_date: action.due_date,
          period_type: action.period_type,
          status: action.status,
          action_type: action.action_type,
          xp_points: action.xp_points,
          difficulty: action.difficulty,
          quest_type: action.quest_type,
          work_item_id: action.work_item_id,
          created_at: action.created_at,
          updated_at: action.updated_at
        }
      end

      def user_json(user)
        {
          id: user.id,
          level: user.level,
          experience_points: user.experience_points,
          xp_to_next_level: user.xp_to_next_level,
          xp_percentage: user.xp_percentage
        }
      end
    end
  end
end

