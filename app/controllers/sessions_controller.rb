class SessionsController < ApplicationController
  skip_before_filter :authorise
  
  def new
  end

  # Create a new session (log in).
  def create
    # If the supplied credentials are valid, setup the session as belonging to the current user.
    if user = User.authenticate(params[:username], params[:password])
      session[:user_id] = user.id
      add_message( "Login successful." )
      redirect_to plays_url
    else
      add_error( "Invalid username and password combination, please try again." )
      redirect_to login_url
    end
  end

  # Log out.
  def destroy
    session[:user_id] = nil
    add_message( "Logged out successfully." )
    redirect_to root_path
  end

end
