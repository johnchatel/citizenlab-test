class WebApi::V1::BasketsController < ApplicationController
  before_action :set_basket, only: [:show, :update, :destroy]

  def show
    render json: @basket, include: ['ideas', 'baskets_ideas']
  end

  def create
    @basket = Basket.new basket_params
    authorize @basket

    if @basket.save
      SideFxBasketService.new.after_create @basket, current_user
      render json: @basket, status: :created
    else
      render json: { errors: @basket.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    new_idea_ids = basket_params[:idea_ids]
    begin
      ActiveRecord::Base.transaction do
        @basket.assign_attributes basket_params.except(:idea_ids)
        if new_idea_ids
          # Remove and add ideas to the basket.
          #
          # The reason we don't simply update on idea_ids is
          # to keep the counter correct.
          old_idea_ids = @basket.idea_ids
          ideas_to_add = new_idea_ids - old_idea_ids
          ideas_to_rmv = old_idea_ids - new_idea_ids
          @basket.baskets_ideas.where(idea_id: ideas_to_rmv).each(&:destroy!)
          ideas_to_add.each{ |idea_id| @basket.baskets_ideas.create!(idea_id: idea_id) }
        end
        # @basket.baskets_ideas.each(&:counter_culture_fix_counts) 
        BasketsIdea.counter_culture_fix_counts if basket_params.keys.include?(:submitted_at)
        raise ClErrors::TransactionError.new(error_key: :unprocessable_basket) if !@basket.save
      end
      SideFxBasketService.new.after_update @basket, current_user
      render json: @basket, status: :ok
    rescue ClErrors::TransactionError => e
      case e.error_key
      when :unprocessable_basket
        render json: { errors: @basket.errors.details }, status: :unprocessable_entity
      else
        raise e
      end
    end
  end

  def destroy
    basket = @basket.destroy
    if basket.destroyed?
      SideFxBasketService.new.after_destroy basket, current_user
      head :ok
    else
      head 500
    end
  end


  private

  def set_basket
    @basket = Basket.find params[:id]
    authorize @basket
  end

  def basket_params
    params.require(:basket).permit(
      :submitted_at,
      :user_id,
      :participation_context_id,
      :participation_context_type,
      idea_ids: []
    )
  end

  def secure_controller?
    false
  end
end
