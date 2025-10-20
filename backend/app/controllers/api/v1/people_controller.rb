module Api
  module V1
    class PeopleController < ApplicationController
      before_action :set_person, only: [:show, :update, :destroy]

      def index
        user_id = params[:user_id]
        if user_id
          people = Person.where(user_id: user_id)
          render json: people
        else
          render json: { error: 'user_id is required' }, status: :bad_request
        end
      end

      def show
        render json: @person
      end

      def create
        @person = Person.new(person_params)

        if @person.save
          render json: @person, status: :created
        else
          render json: { errors: @person.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @person.update(person_params)
          render json: @person
        else
          render json: { errors: @person.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @person.destroy
        head :no_content
      end

      private

      def set_person
        @person = Person.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Person not found' }, status: :not_found
      end

      def person_params
        params.require(:person).permit(:user_id, :name, :role)
      end
    end
  end
end

