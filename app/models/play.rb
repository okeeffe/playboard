class Play < ActiveRecord::Base
  # Sets up the relationship between Plays and Users.
  belongs_to :user
  # Default ordering for a Play is by name.
  default_scope :order => 'name'
  
  # Validations for a Play object.
  
  # This states that a Play's name must be there, must have a minimum length of 1 and is scoped to a 
  # User's ID and the number of players, meaning that a User can only have two Plays with the same name
  # if they have different numbers of players.
  validates :name, :presence => true, :length => {:minimum => 1}, :uniqueness => {:scope => [:user_id, :num_players]} 
  validates :num_players, :presence => true, :numericality => true
  validates :play_type, :presence => true
  validates :json, :presence => true
  
  # Overriding the default as_json method to only encode the attributes I want encoded (for the Play Engine).
  def as_json(options = {})
    {:play_json => {:play_type => self.play_type, :num_players => self.num_players}}
  end
    
  
end
