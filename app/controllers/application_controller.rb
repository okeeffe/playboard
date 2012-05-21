class ApplicationController < ActionController::Base
  before_filter :authorise
  after_filter :discard_flash_if_xhr
  protect_from_forgery
  
  protected
  
    # Helper method for user authentication. Whitelist approach:
    # Assumes every page needs authentication unless you skip it explicitly in the controller.
    def authorise
      unless User.find_by_id(session[:user_id])
        redirect_to login_url, :notice => "Please log in"
      end
    end
    
    # Helper method overloading redirect_to which allows a redirect after an AJAX action (like submitting the new play form)
    def redirect_to(options = {}, response_status = {})
      if request.xhr?
        render(:update) {|page| page.redirect_to(options)}
      else
        super(options, response_status)
      end
    end
    
    # Helper method to get rid of the flash messages that build up on AJAX pages.
    # I skip this after creating a new play, as that form uses AJAX but I need a confirmation flash message.
    def discard_flash_if_xhr
      flash.discard if request.xhr?
    end
end