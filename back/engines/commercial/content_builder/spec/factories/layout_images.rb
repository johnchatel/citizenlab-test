FactoryBot.define do
  factory :layout_image, class: ContentBuilder::LayoutImage do
    image { Rails.root.join('spec/fixtures/image12.png').open }
  end
end
