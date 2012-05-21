class HomeController < ApplicationController
  skip_before_filter :authorise
  
  def index
  end

end
