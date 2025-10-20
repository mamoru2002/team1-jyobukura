module Api
  module V1
    class ReflectionsController < ApplicationController
      before_action :set_reflection, only: [:show, :update]

      def show
        render json: reflection_json(@reflection)
      end

      def create
        user_id = params[:reflection][:user_id]
        @reflection = Reflection.find_or_initialize_by(user_id: user_id)
        @reflection.assign_attributes(reflection_params)

        if @reflection.save
          render json: reflection_json(@reflection), status: :created
        else
          render json: { errors: @reflection.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @reflection.update(reflection_params)
          render json: reflection_json(@reflection)
        else
          render json: { errors: @reflection.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_reflection
        user_id = params[:id]
        @reflection = Reflection.find_by(user_id: user_id)
        
        if @reflection.nil?
          render json: { error: 'Reflection not found' }, status: :not_found
        end
      end

      def reflection_params
        params.require(:reflection).permit(:user_id, :question1_change, :question2_emotion_reason, :question3_surprise)
      end

      def reflection_json(reflection)
        {
          id: reflection.id,
          user_id: reflection.user_id,
          question1_change: reflection.question1_change,
          question2_emotion_reason: reflection.question2_emotion_reason,
          question3_surprise: reflection.question3_surprise,
          created_at: reflection.created_at,
          updated_at: reflection.updated_at
        }
      end
    end
  end
end

