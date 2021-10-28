class AdminApi::BulkDeleteUsersJob < ApplicationJob
  def run(emails)
    emails.each do |email|
      user = User.find_by!(email: email)
      DeleteUserJob.perform_later(user)
    rescue StandardError => e
      Sentry.capture_exception(e)
      Rails.logger.error(([e.message] + e.backtrace).join("\n"))
    end
  end
end
