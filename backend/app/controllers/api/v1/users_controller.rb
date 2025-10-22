module Api
  module V1
    class UsersController < ApplicationController
      before_action :set_user, only: [:show, :update, :dashboard]

      def show
        render json: user_json(@user)
      end

      def create
        @user = User.new(user_params)
        @user.level = 1
        @user.experience_points = 0

        if @user.save
          render json: user_json(@user), status: :created
        else
          render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @user.update(user_params)
          render json: user_json(@user)
        else
          render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def dashboard
        work_items = @user.work_items.includes(
          :motivation_masters,
          :preference_masters,
          :people,
          :role_categories
        )

        actions = @user.actions.where.not(status: '取下げ').order(created_at: :desc)
        action_plan = @user.action_plan

        render json: {
          user: user_json(@user),
          work_items: work_items.map { |wi| work_item_json(wi) },
          actions: actions.map { |a| action_json(a) },
          action_plan: action_plan ? action_plan_json(action_plan) : nil
        }
      end

      private

      def set_user
        @user = User.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'User not found' }, status: :not_found
      end

      def user_params
        params.require(:user).permit(:email, :name, :timezone)
      end

      def user_json(user)
        {
          id: user.id,
          email: user.email,
          name: user.name,
          timezone: user.timezone,
          level: user.level,
          experience_points: user.experience_points,
          xp_to_next_level: user.xp_to_next_level,
          xp_percentage: user.xp_percentage,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      end

      def work_item_json(work_item)
        {
          id: work_item.id,
          name: work_item.name,
          energy_percentage: work_item.energy_percentage,
          reframe: work_item.reframe,
          motivations: work_item.motivation_masters.map { |m| { id: m.id, name: m.name } },
          preferences: work_item.preference_masters.map { |p| { id: p.id, name: p.name } },
          people: work_item.people.map { |p| { id: p.id, name: p.name, role: p.role } },
          role_categories: work_item.role_categories.map { |r| { id: r.id, name: r.name } }
        }
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

      def action_plan_json(action_plan)
        {
          id: action_plan.id,
          next_actions: action_plan.next_actions,
          collaborators: action_plan.collaborators,
          obstacles_and_solutions: action_plan.obstacles_and_solutions
        }
      end
    end
  end
end
