class User < ActiveRecord::Base
  # Establishes the relationship between Users and Plays, and that if a User is deleted, their Plays are too.
  has_many :plays, :dependent => :destroy
  
  # All the validations for a User.
  validates :first_name, :presence => true, :length => {:minimum => 1}
  validates :last_name, :presence => true, :length => {:minimum => 1}
  validates :team, :presence => true, :length => {:minimum => 1}
  validates :username, :presence => true, :uniqueness => true, :length => {:minimum => 4}
  validates :email, :presence => true, :uniqueness => true, :email => true
    
  validates :password, :confirmation => true, :length => {:minimum => 4}
  attr_accessor :password_confirmation
  attr_reader :password
  
  validate :password_must_be_present
  
  # Return the user if they login with the right details
  def User.authenticate(username, password)
    if user = find_by_username(username)
      if user.hashed_password == encrypt_password(password, user.salt)
        user
      end
    end
  end
  
  # Encrypt the user's passsword, adding the arbitrary 'wibble' string for some extra security.
  def User.encrypt_password(password, salt)
    Digest::SHA2.hexdigest(password + "wibble" + salt)
  end
  
  # Method to save the password as an encrypted version of itself
  # (overrides the standard setter created by attr_accessor above)
  # 'password' is a virtual attribute.
  def password=(password)
    @password = password
    
    if password.present?
      generate_salt
      self.hashed_password = self.class.encrypt_password(password, salt)
    end
  end
  
  private
  
    # Checks if the hashed password is present
    def password_must_be_present
      errors.add(:password, "can't be blank") unless hashed_password.present?
    end
    
    # Generate the salt for the hashed password
    def generate_salt
      self.salt = self.object_id.to_s + rand.to_s
    end

end
