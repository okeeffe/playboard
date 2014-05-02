//Class to encapsulate the objects and functions associated with a play.
var Play = new Class
({
	Implements : [Options, Events],
	
	options : {
		numPlayers : 11,
		playType : 'Offensive',
		players : []
	},

	players : [],
	dragging : false,

	//Constructor which also handles the existing players.
	initialize : function(options)
	{
		this.setOptions(options);
		//If there are players given in the options, add them to the players array.
		this.addPlayers(this.options.players);
		this.selectedPlayer = null;
	},
	
	/* ----------Getters and Setters---------- */

	setType : function(newType)
	{
		this.type = newType;
	},
	
	getType : function()
	{
		if(this.type)
			return this.type;
		else
			return this.options.type;
	},

	setNumPlayers : function(newNumPlayers)
	{
		this.numPlayers = newNumPlayers;
	},
	
	getNumPlayers : function()
	{
		if(this.numPlayers)
			return this.numPlayers;
		else
			return this.options.numPlayers;
	},
	
	setDragging : function(bool)
	{
		this.dragging = bool;
	},
	
	getDragging : function()
	{
		return this.dragging;
	},
	
	setWidth : function(newWidth)
	{
		this.WIDTH = newWidth;
	},
	
	setHeight : function(newHeight)
	{
		this.HEIGHT = newHeight;
	},
	
	setSelectedPlayer : function(player)
	{
		this.selectedPlayer = player;
	},
	
	/* ----------Important Functions---------- */
	
	//Function to handle clicks on the Play. Adds a new player when the limit has not been reached.
	clicked : function(point, adding)
	{
		if(this.selectedPlayer === null && adding)
		{
			if(this.players.length < this.getNumPlayers())
			{
				var newPlayer = new Player({position : point});
				this.selectedPlayer = newPlayer;
				this.selectedPlayer.populateInfoBox();
				this.addPlayer(newPlayer);
				newPlayer = null;
			}
		}
	},
	
	//Function to handle mouseDown - selects/deselects clicked objects and establishes drag.
	mouseDown : function(point)
	{
		//First, check whether the click has landed on a player.
		this.selectedPlayer = this.checkHit(point);
		if(this.selectedPlayer !== null)
		{
			//If it has, show that player's details and start the dragging.
			this.selectedPlayer.populateInfoBox();
			this.dragging = true;
		}
	},
	
	//Function that handles the movement of an element.
	//Updates player's keyframes by simply moving the first keyframe along with the player's position.
	moveElement : function(point)
	{
		if(this.dragging)
		{
			//Necessary to set two new points as otherwise they are tied together and this causes problems when animating.
			this.selectedPlayer.setPosition(new Point(point.getX(), point.getY()));
			this.selectedPlayer.keyframes[0].setPoint(new Point(point.getX(), point.getY()));
		}
	},
	
	//Function that handles what happens when a drag is finished.
	mouseUp : function(point)
	{
		if(this.selectedPlayer !== null && this.dragging)
		{
			//Check the player has not been dragged out of bounds. If it has, boundsCheck handles it.
			this.selectedPlayer = this.boundsCheck(this.selectedPlayer);
		}
		
		this.dragging = false;
	},
	
	//Function to handle assigning of keyframe waypoints to player.
	order : function(point)
	{
		if(this.selectedPlayer !== null)
		{
			//Get the last order given to ensure it's not the same (i.e. a double right click in the exact same point). (bugfix).
			var lastPoint = this.selectedPlayer.getLatestKeyframe().getPoint();
			//If it's not, create a new keyframe at that point and give it to the player.
			if(!lastPoint.equals(point))
			{
				var keyframe = new Keyframe();
				keyframe.setPoint(point);
				this.selectedPlayer.addKeyframe(keyframe);
			}
			lastPoint = null;
		}
	},
	
	//Function to handle deletion of first a player's keyframes/waypoints (if any) and then the player itself.
	delete : function()
	{
		if(this.selectedPlayer !== null)
		{
			//If the player has keyframes, delete the most recently added one.
			if(this.selectedPlayer.keyframes.length > 1)
				this.selectedPlayer.keyframes.erase(this.selectedPlayer.keyframes.getLast());
			else
				this.deletePlayer(this.selectedPlayer);
		}
	},
	
	//Function to respond to the number of players changing on the play edit form.
	changeNumPlayers : function(evt)
	{
		//Turn the value from a string to an int.
		var newNum = parseInt(evt.target.value);
		
		//While there are more players than the new value...
		while(newNum < this.players.length)
		{
			//...delete the most recently added ones.
			this.deletePlayer(this.players.getLast());
		}
		//Set this number of players as the new stored value.
		this.setNumPlayers(newNum);
		
		newNum = null;
	},
	
	//Function to respond to the type of play changing on the play edit form.
	changePlayType : function(evt)
	{
		this.setType(evt.target.value);
	},

	//Similar to keyframe class, adds players to the active array upon initialisation with player array option.
	addPlayers : function(newPlayers)
	{
		newPlayers.each(function(player)
		{
			this.players.include(player);
		}, this);	
	},

	//Function that checks if the max number of players has been reached, adds a player (as 
	//an array object using $splat and the plural method) if not.
	addPlayer : function(newPlayer)
	{
		if(this.players.length < this.getNumPlayers())
		{
			newPlayer = this.boundsCheck(newPlayer);
			this.addPlayers($splat(newPlayer));
		}
		else
			alert('You already have ' + this.getNumPlayers() + ' players on the field. Delete a player or drag an existing player to where you want.');
	},
	
	//Function to delete a player from the play.
	deletePlayer : function(player)
	{
		//A quick assertion that the passed player is the selected one, and subsequently deselecting it.
		if(this.selectedPlayer == player)
			this.selectedPlayer = null;
		
		//Erase the player.
		this.players.erase(player);
		//Call updateIndexes to keep the array tidy.
		this.updateIndexes();
	},
	
	//Function to reset the indexes - useful to keep array ordered and the correct length after a deletion,
	//so that subsequent additions don't swell the array due to now null entries earlier in it.
	updateIndexes : function()
	{
		for(var i = 0; i < this.players.length - 1; i++)
		{
			//If a player is null, move down the one above it and continue.
			if(this.players[i] === null)
			{
				this.players[i] = this.players[i+1];
				this.players[i+1] = null;
			}
		}
	},
	
	//Function to make sure the player is fully within the bounds of the canvas. If not, the player is forced
	//back inbounds.
	boundsCheck : function(newPlayer)
	{
		var radius = newPlayer.getRadius();
		var pt = newPlayer.getPosition();
		
		if(pt.getX() < radius)
			pt.setX(pt.getX() + (radius - pt.getX()));
		else if(this.WIDTH - pt.getX() < radius)
			pt.setX(this.WIDTH - radius);
			
		if(pt.getY() < radius)
			pt.setY(pt.getY() + (radius - pt.getY()));
		else if(this.HEIGHT - pt.getY() < radius)
			pt.setY(this.HEIGHT - radius);
			
		newPlayer.setPosition(new Point(pt.getX(), pt.getY()));
		newPlayer.keyframes[0].setPoint(new Point(pt.getX(), pt.getY()));
		
		pt = null;
		radius = null;
		
		return newPlayer;
	},
	
	//Function to check if the passed cursor position point is on a player. Returns the player if so.
	checkHit : function(point)
	{
		var hitPlayer = null;
		this.players.each(function(player)
		{
			if(player.hit(point))
				hitPlayer = player;
		}, this);
		
		return hitPlayer;
	},
	
	//Draw function for Play.
	draw : function(context)
	{
		//If no player is selected, clear the Player Details box.
		if(!this.selectedPlayer)
		{
			this.clearInfoBox();
		}
		
		//Then loop through and call draw on each player.
		this.players.each(function(player)
		{
			if(this.selectedPlayer)
			{
				//If a player is selected, draw it as such.
				if(player == this.selectedPlayer)
					player.drawSelected(context);
				else
					player.draw(context);
			}
			else
				player.draw(context);
		}, this);
	},
	
	//Function to clear the Player Details sidebar in the event of a deselection.
	clearInfoBox : function()
	{
		if($('details'))
		{
			var newDetails = new Element('div', {id : 'details'});
			newDetails.replaces($('details'));
		}
	},
	
	//Function to calculate how many steps it will take to fully animate a play.
	//Gets the route length from each player (in steps) to decide.
	calcAnimationSteps : function()
	{
		var longestRoute = 0;
		this.players.each(function(player)
		{
			if(player.routeLength() > longestRoute)
				longestRoute = player.routeLength();
		}, this);
		
		return longestRoute;
	},
	
	//Function to animate the play by calling animate on each player.
	animate : function()
	{
		this.selectedPlayer = null;

		this.players.each(function(player)
		{
			player.animate();
		}, this);
	},
	
	//Function to reset the player positions post-animation.
	resetIt : function()
	{
		this.players.each(function(player)
		{
			player.resetIt();
		}, this);
	},
	
	//Function to package the play as a JSON object for sending to the server. Calls save on each player
	//before saving its own properties. It correctly structures the JSON string, and then encodes it as
	//a JSON object.
	save : function()
	{
		var playJSON = {};
		
		var playersJSON = [];
		for(var i = 0; i < this.players.length; i++)
		{
			playersJSON[i] = this.players[i].save();
		}
		var playersCollectedJSON = {};
		playersCollectedJSON.players = playersJSON;
		
		var playTypeJSON = {play_type : this.getType()};
		var playNumPlayersJSON = {num_players : this.getNumPlayers()};
		
		playJSON.play_json = Object.merge(playTypeJSON, playNumPlayersJSON, playersCollectedJSON);
		return JSON.encode(playJSON);
	}
});