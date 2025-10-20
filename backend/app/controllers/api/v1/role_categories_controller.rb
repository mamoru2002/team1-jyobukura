module Api
  module V1
    class RoleCategoriesController < ApplicationController
      before_action :set_role_category, only: [:show, :update, :destroy]

      def index
        user_id = params[:user_id]
        if user_id
          role_categories = RoleCategory.where(user_id: user_id)
          render json: role_categories
        else
          render json: { error: 'user_id is required' }, status: :bad_request
        end
      end

      def show
        render json: @role_category
      end

      def create
        @role_category = RoleCategory.new(role_category_params)

        if @role_category.save
          render json: @role_category, status: :created
        else
          render json: { errors: @role_category.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @role_category.update(role_category_params)
          render json: @role_category
        else
          render json: { errors: @role_category.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @role_category.destroy
        head :no_content
      end

      private

      def set_role_category
        @role_category = RoleCategory.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'RoleCategory not found' }, status: :not_found
      end

      def role_category_params
        params.require(:role_category).permit(:user_id, :name, :description)
      end
    end
  end
end

