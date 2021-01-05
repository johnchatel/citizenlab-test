require 'rails_helper'

RSpec.describe EmailCampaigns::InviteReceivedMailer, type: :mailer do
  describe 'InviteReceived' do
    before do 
      EmailCampaigns::Campaigns::InviteReceived.create!
      @recipient = create(:user, locale: 'en')
      EmailCampaigns::UnsubscriptionToken.create!(user_id: @recipient.id)
    end

    let(:token) { InvitesService.new.generate_token }
    let(:inviter) { create(:admin) }
    let(:invite_text) { 'Would you like to join our awesome platform?' }
    let(:command) {{
      recipient: @recipient,
      event_payload: {
        inviter_first_name: inviter.first_name,
        inviter_last_name: inviter.last_name,
        invitee_first_name: @recipient.first_name,
        invitee_last_name: @recipient.last_name,
        invite_text: "<p>#{invite_text}</p>",
        activate_invite_url: Frontend::UrlService.new.invite_url(token, locale: @recipient.locale)
      }
    }}
    let(:mail) { described_class.campaign_mail(EmailCampaigns::Campaigns::InviteReceived.first, command).deliver_now }

    it 'renders the subject' do
      expect(mail.subject).to start_with('You are invited to')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([@recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns organisation name' do
      expect(mail.body.encoded).to match(Tenant.current.settings.dig('core', 'organization_name')['en'])
    end

    it 'assigns invite url' do
      expect(mail.body.encoded)
        .to include(command[:event_payload][:activate_invite_url])
    end

    it 'assigns invite text' do
      expect(mail.body.encoded)
        .to match(invite_text)
    end
  end
end