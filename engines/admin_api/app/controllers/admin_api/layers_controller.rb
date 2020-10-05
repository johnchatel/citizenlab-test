module AdminApi
  class LayersController < AdminApiController

    def create
      map_config = Maps::MapConfig.find_by(project_id: params[:project_id])
      return head(400) if map_config.blank?

      layer_attributes = params.require(:data).require(:attributes)
                               .permit(:default_enabled, title_multiloc: {})
      layer_attributes.merge!({
        geojson: params.dig(:data, :attributes, :geojson).try(:permit!),  # allow everything for geojson
        map_config_id: map_config.id,
      })

      new_layer = Maps::Layer.create(layer_attributes)
      if new_layer.save
        render json: LayerSerializer.new(new_layer)
      else
        render json: {errors: new_layer.errors.details}, status: :unprocessable_entity
      end
    end

    def destroy
      layers = Maps::Layer.destroy_by(id: params[:id], map_config_id: params[:map_config_id])
      if layers.blank?
        send_not_found
      elsif layers.first.destroyed?
        head(:ok)
      else
        head(500)
      end
    end

    def index
      map_configs = Maps::MapConfig.includes(:layers).find_by(project_id: params["project_id"])
      # map_configs.length = 0 or 1
      return send_not_found unless map_config.present?

      layers = map_configs.first.layers
      render json: LayerSerializer.new(layers)
    end

    def show
      layer = Maps::Layer.includes(:map_config).find(params[:id])
      if layer.blank?
        head(404)
      elsif layer.map_config.project_id != params[:project_id]
        return head(400)
      else
        render json: LayerSerializer.new(layer)
      end
    end
  end
end