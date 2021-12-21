module FlagInappropriateContent
  class WebApi::V1::Notifications::InappropriateContentFlaggedSerializer < ::WebApi::V1::Notifications::NotificationSerializer
    attribute :flaggable_url do |object|
      Frontend::UrlService.new.model_to_url object.inappropriate_content_flag.flaggable
    end
    
    attribute :flaggable_path do |object|
      Frontend::UrlService.new.model_to_path object.inappropriate_content_flag.flaggable
    end
  end
end
