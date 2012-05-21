class CreatePlays < ActiveRecord::Migration
  def self.up
    create_table :plays do |t|
      t.string :name
      t.text :description
      t.integer :num_players
      t.string :type
      t.text :json

      t.timestamps
    end
  end

  def self.down
    drop_table :plays
  end
end
