module Api
  module V1
    class PreferenceMastersController < ApplicationController
      before_action :set_preference_master, only: [:show, :update, :destroy]

      def index
        user_id = params[:user_id]
        if user_id
          preferences = PreferenceMaster.where(user_id: user_id)
          render json: preferences
        else
          render json: { error: 'user_id is required' }, status: :bad_request
        end
      end

      def show
        render json: @preference_master
      end

      def create
        @preference_master = PreferenceMaster.new(preference_master_params)

        if @preference_master.save
          render json: @preference_master, status: :created
        else
          render json: { errors: @preference_master.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @preference_master.update(preference_master_params)
          render json: @preference_master
        else
          render json: { errors: @preference_master.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @preference_master.destroy
        head :no_content
      end

      private

      def set_preference_master
        @preference_master = PreferenceMaster.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'PreferenceMaster not found' }, status: :not_found
      end

      def preference_master_params
        params.require(:preference_master).permit(:user_id, :name, :description)
      end
    end
  end
end

