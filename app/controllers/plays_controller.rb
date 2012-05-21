class PlaysController < ApplicationController
  # Skips the discard flash after xhr method in the Application Controller following a create.
  skip_after_filter :discard_flash_if_xhr, :only => [:create]
  
  # GET /plays
  # GET /plays.xml
  def index
    # Only show the current user their own plays.
    current_user = get_current_user
    @plays = current_user.plays

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @plays }
    end
  end

  # GET /plays/1
  # GET /plays/1.xml
  def show
    @play = Play.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @play }
      format.json { render :json => @play[:json] }
    end
  end

  # GET /plays/new
  # GET /plays/new.xml
  def new
    # Set up a new play associated with the current user.
    current_user = get_current_user
    @play = current_user.plays.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @play }
    end
  end

  # GET /plays/1/edit
  def edit
    @play = Play.find(params[:id])
    
    # Respond to the AJAX requests from the Play Engine with the Play Json and the HTML with the database record.
    respond_to do |format|
      format.html
      format.json { render :json => @play[:json] }
    end
  end

  # POST /plays
  # POST /plays.xml
  def create
    # Create a new play associated with the current user.
    current_user = get_current_user
    @play = current_user.plays.new(params[:play])
    # Populate the JSON field with the play's JSON representation.
    @play[:json] = @play.to_json

    respond_to do |format|
      if @play.save
        add_message( "Play successfully created." )
        # If the play was successfully created (passed validations), redirect to the edit screen for the play.
        format.html { redirect_to edit_play_path(@play) }
        format.xml  { render :xml => @play, :status => :created, :location => @play }
      else
        format.html do
          if request.xhr?
            # Otherwise if it was an AJAX request, send back the errors as JSON.
            render :json => @play.errors, :status => :unprocessable_entity
          else
            render :action => 'new'
          end
        end
        format.xml  { render :xml => @play.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /plays/1
  # PUT /plays/1.xml
  # A fully AJAX controller.
  def update
    @play = Play.find(params[:id])
    
    # If in the Update XHR there is a parameter called play_json, that's from the Play Engine,
    # so set the play's JSON to that.
    if(params[:play_json])
      @play[:json] = params[:play_json]
    end
    
    respond_to do |format|
      # If the play successfully saved, send back the OK response.
      if @play.update_attributes(params[:play])
        add_message( "Play successfully saved." )
        format.html { head :ok }
        format.xml  { head :ok }
        format.json { head :ok }
      else
        # Otherwise, send back the errors as JSON, to be handled on the frontend.
        add_error( "Oops, something messed up. Please try again." )
        format.html do
          if request.xhr?
            render :json => @play.errors, :status => :unprocessable_entity
          else
            render :action => 'edit'
          end
        end
        format.xml  { render :xml => @play.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /plays/1
  # DELETE /plays/1.xml
  def destroy
    @play = Play.find(params[:id])
    @play.destroy

    respond_to do |format|
      add_message( "Play successfully destroyed." )
      format.html { redirect_to(plays_url) }
      format.xml  { head :ok }
    end
  end
  
  # Helper method to grab the current user from the session's stored user_id.
  def get_current_user
    User.find_by_id(session[:user_id])
  end
end
