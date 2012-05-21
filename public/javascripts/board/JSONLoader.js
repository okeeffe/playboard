//Simple class to handle returned JSON objects, parse them and turn them into Play objects.
var JSONLoader = new Class
({
	//No options needed.
	initialize : function(jsonObject)
	{
		//Check the received JSON is the correct data.
		if(jsonObject.play_json)
			this.jsonPlay = jsonObject.play_json;
		else
			alert('Error loading play.');
	},
	
	//This is the function to return the Play object. It uses the other functions in the file to build up
	//the options for initialising the Play.
	returnPlay : function()
	{
		//If there are players to load, load them and their keyframes.
		if(this.jsonPlay.players)
			this.play = new Play({playType : this.jsonPlay.play_type, numPlayers : this.jsonPlay.num_players, players : this.parsePlayers(this.jsonPlay.players)});
		//Otherwise it is a blank play and the job is much simpler.
		else
			this.play = new Play({playType : this.jsonPlay.play_type, numPlayers : this.jsonPlay.num_players});
			
		return this.play;
	},
	
	//Function to parse the returned players.
	parsePlayers : function(players)
	{
		var realPlayers = [];
		//For each player in the JSON, create a new player object, parsing their keyframes by calling parseKeyframes.
		players.each(function(player)
		{
			tmp = new Player({blocking : player.blocking, initials : player.initials, speed : parseInt(player.speed), keyframes : this.parseKeyframes(player)});
			realPlayers.include(tmp);
		}, this);
		
		return realPlayers;
	},
	
	//Function to parse the returned players' keyframes.
	parseKeyframes : function(player)
	{
		var keyframes = [];
		//For each keyframe in the player's JSON, create a new keyframe object.
		player.keyframes.each(function(keyframe)
		{
			tmp = new Keyframe({curve : keyframe.curve, stutter : keyframe.stutter, x : parseInt(keyframe.x), y : parseInt(keyframe.y)});
			keyframes.include(tmp);
		}, this);
		
		return keyframes;
	}
});