class RenameTypeAsPlayTypeInPlays < ActiveRecord::Migration
  def self.up
    rename_column :plays, :type, :play_type
  end

  def self.down
  end
end
