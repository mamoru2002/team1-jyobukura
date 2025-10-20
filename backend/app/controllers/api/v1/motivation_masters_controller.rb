module Api
  module V1
    class MotivationMastersController < ApplicationController
      before_action :set_motivation_master, only: [:show, :update, :destroy]

      def index
        user_id = params[:user_id]
        if user_id
          motivations = MotivationMaster.where(user_id: user_id)
          render json: motivations
        else
          render json: { error: 'user_id is required' }, status: :bad_request
        end
      end

      def show
        render json: @motivation_master
      end

      def create
        @motivation_master = MotivationMaster.new(motivation_master_params)

        if @motivation_master.save
          render json: @motivation_master, status: :created
        else
          render json: { errors: @motivation_master.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @motivation_master.update(motivation_master_params)
          render json: @motivation_master
        else
          render json: { errors: @motivation_master.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @motivation_master.destroy
        head :no_content
      end

      private

      def set_motivation_master
        @motivation_master = MotivationMaster.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'MotivationMaster not found' }, status: :not_found
      end

      def motivation_master_params
        params.require(:motivation_master).permit(:user_id, :name, :description)
      end
    end
  end
end

