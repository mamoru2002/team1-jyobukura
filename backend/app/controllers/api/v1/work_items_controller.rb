module Api
  module V1
    class WorkItemsController < ApplicationController
      before_action :set_work_item, only: [:show, :update, :destroy]

      def index
        user_id = params[:user_id]
        if user_id
          work_items = WorkItem.where(user_id: user_id).includes(
            :motivation_masters, 
            :preference_masters, 
            :people, 
            :role_categories
          )
          render json: work_items.map { |wi| work_item_json(wi) }
        else
          render json: { error: 'user_id is required' }, status: :bad_request
        end
      end

      def show
        render json: work_item_json(@work_item)
      end

      def create
        @work_item = WorkItem.new(work_item_params)

        if @work_item.save
          render json: work_item_json(@work_item), status: :created
        else
          render json: { errors: @work_item.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @work_item.update(work_item_params)
          render json: work_item_json(@work_item)
        else
          render json: { errors: @work_item.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @work_item.destroy
        head :no_content
      end

      private

      def set_work_item
        @work_item = WorkItem.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'WorkItem not found' }, status: :not_found
      end

      def work_item_params
        params.require(:work_item).permit(:user_id, :name, :energy_percentage, :reframe)
      end

      def work_item_json(work_item)
        {
          id: work_item.id,
          user_id: work_item.user_id,
          name: work_item.name,
          energy_percentage: work_item.energy_percentage,
          reframe: work_item.reframe,
          motivations: work_item.motivation_masters.map { |m| { id: m.id, name: m.name } },
          preferences: work_item.preference_masters.map { |p| { id: p.id, name: p.name } },
          people: work_item.people.map { |p| { id: p.id, name: p.name, role: p.role } },
          role_categories: work_item.role_categories.map { |r| { id: r.id, name: r.name } },
          created_at: work_item.created_at,
          updated_at: work_item.updated_at
        }
      end
    end
  end
end

