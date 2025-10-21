Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"

  namespace :api do
    namespace :v1 do
      resources :users, only: [:show, :create, :update] do
        member do
          get :dashboard
        end
      end

      resources :work_items
      resources :reflections, only: [:show, :create, :update]
      resources :actions do
        member do
          post :complete
        end
      end
      resources :action_plans, only: [:show, :create, :update]

      resources :motivation_masters
      resources :preference_masters
      resources :people
      resources :role_categories
    end
  end
end
