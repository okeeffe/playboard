//Class to encapsulate the objects and functions associated with each player.
var Player = new Class
({
	Implements : [Options, Events],
	
	//Initialisation options for Player
	options : {
		keyframes : [],
		position: new Point(),
		blocking : false,
		initials : '',
		speed : 10
	},

	keyframes : [], //Array to hold keyframes for the player.
	frameNum : 0,	//Current frame.
	frameChanged : true,
	curAngle : 0,
	radius : 15,	//Size of a player's circle representation for drawing.
	
	//Constructor, sets the player up according to the passed options and handles keyframes.
	initialize : function(options)
	{
		//Setup the player.
		this.setOptions(options);
		this.blocking = this.options.blocking;
		this.speed = this.options.speed;
		this.initials = this.options.initials;
		this.position = this.options.position;
		
		//If there are keyframes in initialisation...
		if(options.keyframes)
		{
			//...add all the keyframes to the array.
			this.addKeyframes(this.options.keyframes);
			//...set initial position to position of the first keyframe.
			this.position = this.keyframes[0].getPoint();
		}
		else //There aren't any, but there should be an initial position so...
		{
			var initialKeyframe = new Keyframe();
			initialKeyframe.setPoint(new Point(this.position.getX(), this.position.getY()));
			//...make that the first keyframe.
			this.addKeyframe(initialKeyframe);
			initialKeyframe = null;
		}
	},
	
	/* ----------Getters and Setters---------- */
	
	getRadius : function()
	{
		return this.radius;
	},
		
	getPosition : function()
	{
		return this.position;
	},
	
	setPosition : function(newPoint)
	{
		this.position = newPoint;
	},
	
	getLatestKeyframe : function()
	{
		return this.keyframes.getLast();
	},
	
	getInitials : function()
	{
		return this.initials;
	},
	
	setInitials : function(newInitials)
	{
		this.initials = newInitials;
	},
	
	getSpeed : function()
	{
		return this.speed;
	},
	
	setSpeed : function(newSpeed)
	{
		this.speed = newSpeed;
	},
	
	getBlocking : function()
	{
		return this.blocking;
	},
	
	setBlocking : function(newBlocking)
	{
		this.blocking = newBlocking;
	},
	
	/* ----------Important Functions---------- */
	
	//Function to check if player icon under cursor.
	hit : function(point)
	{
		if(this.insideIcon(point))
			return true;
	},
	
	//Function to check if a point falls within the player icon.
	insideIcon : function(point)
	{
		return ((point.getX() - this.position.getX()) * (point.getX() - this.position.getX()) + (point.getY() - this.position.getY()) * (point.getY() - this.position.getY()) <= this.radius * this.radius);
	},
	
	//Function which takes in an array of keyframes and adds them to the 
	//internal array.
	addKeyframes : function(newKeyframes)
	{
		newKeyframes.each(function(keyframe)
		{
			this.keyframes.include(keyframe);
		}, this);
	},

	//Function which converts a single keyframe to an array object ($splat) and 
	//uses the addKeyframes(newKeyframes) function to add it to the array.
	addKeyframe : function(newKeyframe)
	{
		this.addKeyframes($splat(newKeyframe));
	},
	
	//Function to populate the HTML of the Player Details box in order for a user to see and edit attributes.
	populateInfoBox : function()
	{
		//Grab the details div for manipulation.
		var details = $('details');
		
		//Make sure it exists first.
		if(details)
		{
			//Blocking Selection Code. Sets up the options in the correct order depending on the blocking variable.
			if(this.getBlocking())
			{
				var option1 = new Element('option', {value : 'blocking', text : 'Blocking'});
				var option2 = new Element('option', {value : 'running', text : 'Passing/Rushing'});
			}
			else
			{
				var option1 = new Element('option', {value : 'running', text : 'Passing/Rushing'});
				var option2 = new Element('option', {value : 'blocking', text : 'Blocking'});
			}

			//Create a select box with those options.
			var select = new Element('select', {id : 'blockingSelector', title : 'Route Type Selector'});
			option1.inject(select);
			option2.inject(select);

			//Add the change event so that the player responds to a user's changes.
			select.addEvent('change', this.onBlockingChange.bind(this));

			//If one already exists, replace it (i.e. swapping from one player to another).
			if($('blockingSelector'))
			{
				select.replaces($('blockingSelector'));
			}
			else
			{
				select.inject(details);
			}
			
			//Speed Selection Code. Again, establishes the correct options in relation to the player's speed variable.
			if(this.getSpeed() == 10)
			{
				var option3 = new Element('option', {value : 'medium', text : 'Medium'});
				var option4 = new Element('option', {value : 'slow', text : 'Slow'});
				var option5 = new Element('option', {value : 'fast', text : 'Fast'});
			}
			else if(this.getSpeed() == 7)
			{
				var option3 = new Element('option', {value : 'slow', text : 'Slow'});
				var option4 = new Element('option', {value : 'medium', text : 'Medium'});
				var option5 = new Element('option', {value : 'fast', text : 'Fast'});
			}
			else if(this.getSpeed() == 13)
			{
				var option3 = new Element('option', {value : 'fast', text : 'Fast'});
				var option4 = new Element('option', {value : 'slow', text : 'Slow'});
				var option5 = new Element('option', {value : 'medium', text : 'Medium'});
			}

			//Again, sets up a select box with the correct options.
			var select2 = new Element('select', {id : 'speedSelector', title : 'Speed Selector'});
			option3.inject(select2);
			option4.inject(select2);
			option5.inject(select2);

			//Adds the change event.
			select2.addEvent('change', this.onSpeedChange.bind(this));

			//And replaces one if it already exists.
			if($('speedSelector'))
			{
				select2.replaces($('speedSelector'));
			}
			else
			{
				select2.inject(details);
			}
			
			//Initials Code. Much like the others, establishes a text area populated with the player's current setting.
			var initialsField = new Element('textarea', {id : 'initialsField', value : this.getInitials(), placeholder : '88', size : 2, maxlength : 2, title: 'Player Initials'});
			
			//Adds the keyUp event so that the typing in the box is detected.
			initialsField.addEvent('keyup', this.onInitialsChange.bind(this));
			
			//And replaces one if it's already there.
			if($('initialsField'))
			{
				initialsField.replaces($('initialsField'));
			}
			else
			{
				initialsField.inject(details);
			}
			title = null;
			details = null;
			select = null;
			option1 = null;
			option2 = null;
			select2 = null;
			option3 = null;
			option4 = null;
			option5 = null;
		}
	},
	
	//Function to handle a user changing a player's blocking attribute.
	onBlockingChange : function(evt)
	{
		if(evt.target.value == 'blocking')
			this.setBlocking(true);
		else
			this.setBlocking(false);
	},
	
	//Function to handle a user changing a player's initials.
	onInitialsChange : function(evt)
	{
		this.setInitials(evt.target.value);
	},
	
	//Function to handle a user changing a player's speed attribute.
	onSpeedChange : function(evt)
	{
		if(evt.target.value == 'fast')
			this.setSpeed(13);
		else if(evt.target.value == 'slow')
			this.setSpeed(7);
		else if(evt.target.value == 'medium')
			this.setSpeed(10);
	},
	
	//Function to draw a circle to represent the player, as well as draw the initials inside.
	//Selected is a boolean indicating whether or not the circle should be filled.
	circle : function(x, y, radius, selected, context)
	{
		context.beginPath();
		context.arc(x, y, radius, 0, Math.PI*2, true);
		context.closePath();
		context.stroke();
		
		if(selected)
		{
			context.fillStyle = '#eee';
			context.fill();
			if(this.getInitials() != '')
			{
				context.fillStyle = '#444';
				context.fillText(this.getInitials(), x, y+5);
			}
		}
		else
		{
			context.fillStyle = '#444';
			context.fill();
			if(this.getInitials != '')
			{
				context.fillStyle = '#eee';
				context.fillText(this.getInitials(), x, y+5);
			}
		}
	},
	
	//Function to draw a line between two points.
	line : function(x1, y1, x2, y2, context)
	{
		context.beginPath();
		context.moveTo(x1, y1);
		context.lineTo(x2, y2);
		context.stroke();
		context.closePath();
	},
	
	//Draw function for a player.
	draw : function(context)
	{
		//If the player has a route, draw it.
		if(this.keyframes.length > 1)
			this.drawRoute(context);
		
		//Or/Then draw the player itself.
		this.circle(this.position.getX(), this.position.getY(), this.radius, false, context);	
	},
	
	//Draw a highlighted player (gives a different value for the selected boolean).
	drawSelected : function(context)
	{
		if(this.keyframes.length > 1)
		{
			this.drawRoute(context);
		}
		this.circle(this.position.getX(), this.position.getY(), this.radius, true, context);
	},
	
	//Function to calculate the angle of a line for use with drawing the arrows
	//and blocking bars. Uses trigonometry. Canvas uses radian angles.
	calcLineDirection : function(pt1, pt2)
	{
		var degsToRads = Math.PI / 180; //Necessary to avoid magic numbers.
		
		var direction; //Holds the angle for returning.
		
		//The following two lines effectively translate the start point to the origin
		//and translate the end point the same amount, in order to simplify the trig.
		var calcPoint = new Point(pt2.getX() - pt1.getX(), pt2.getY() - pt1.getY());
		var origin = new Point(0, 0);
		
		
		//Makes sure I never divide by 0.
		if(origin.getX() == calcPoint.getX())
			origin.setX(-0.00001);
		
		//Calculates the angle of the line in relation to the x axis (using arc/inverse tan).
		direction = Math.atan(calcPoint.getY() / calcPoint.getX());
		
		//Up until this point, the function works for all cases where the end point has
		//a positive x value. When x is negative (line heading left), this needs to be
		//compensated for. I realised that in this case, direction can be either negative
		//or positive, but what needs to happen to both can be done in one line of code.
		//Effectively, this covers the cases where:
		//1. The angle is greater than 90 but less than 180;
		//2. The angle is less than -90 but greater than -180;
		//i.e, quadrants 2 and 3.
		//In case 1, the angle is positive, so taking 180 from it brings it back around.
		//In case 2, the angle is negative, so subtracting 180 effectively adds the 180 to it (given that it is a circle).
		//This is tough to explain without a diagram, but I hope this is somewhat clear.
		if(calcPoint.getX() < 0)
		{
			direction -= 180 * degsToRads;
		}
		
		calcPoint = null;
		origin = null;
		degsToRads = null;
		
		return direction;
	},

	//Draw the arrow/blocking bar on the end of a route.
	drawRouteEnd : function(context, pt1, pt2)
	{
		//Save the current state of the context.
		context.save();
		//Translate the end point to the origin.
		context.translate(pt2.getX(), pt2.getY());
		//Rotate by the amount needed.
		context.rotate(this.calcLineDirection(pt1, pt2));
		
		//Draw the correct kind of route end.
		if(!this.blocking)
		{
			this.line(0, 0, -8, -8, context);
			this.line(0, 0, -8, 8, context);
		}
		else
			this.line(0, -8, 0, 8, context);
		
		//Restore the context (undoing the translation).
		context.restore();
	},
	
	//Function to draw a player's route. Has undergone numerous refactors, most notably to accommodate
	//animation.
	drawRoute : function(context)
	{
		//Start from the current frame (needed for animation).
		for(var n = this.frameNum; n < this.keyframes.length - 1; n++)
		{	
			//If the player is on this frame.
			if(n == this.frameNum)
			{
				//Draw the line from the player's position, not the start of the keyframe.
				var start = this.getPosition();
				var end = this.keyframes[n+1].getPoint();
			}
			//Otherwise, draw the line between the two keyframes.
			else
			{
				var start = this.keyframes[n].getPoint();
				var end = this.keyframes[n+1].getPoint();
			}
			
			this.line(start.getX(), start.getY(), end.getX(), end.getY(), context);
			
			//If this is the second to last keyframe, draw the route ending on the end of its line (the end of the route).
			if(n == this.keyframes.length - 2)
			{
				this.drawRouteEnd(context, start, end);
			}
			
			start = null;
			end = null;
		}
	},
	
	//Function to calculate the length of a route in steps (the length of a route divided by the speed of the player).
	routeLength : function()
	{
		var length = 0;
		for(var i = 0; i < this.keyframes.length - 1; i++)
		{
			length += this.calcLineLength(this.keyframes[i].getPoint(), this.keyframes[i+1].getPoint());
		}
		return length/this.speed;
	},
	
	//Function to calculate the length of a line.
	calcLineLength : function(pt1, pt2)
	{
		return Math.sqrt((pt2.getX() - pt1.getX()) * (pt2.getX() - pt1.getX()) + (pt2.getY() - pt1.getY()) * (pt2.getY() - pt1.getY()));
	},
	
	//Function to animate a player along its keyframe/waypoint-created route.
	animate : function()
	{
		//If the player has a route and the active frame is not the end of it...
		if(this.keyframes.length > 1 && this.frameNum < this.keyframes.length - 1)
		{
			//...and if the frame has changed since the last one (i.e, the player has turned a corner)...
			if(this.frameChanged)
			{
				//...get the new angle of movement for the player.
				this.curAngle = this.calcLineDirection(this.keyframes[this.frameNum].getPoint(), this.keyframes[this.frameNum + 1].getPoint());
				this.frameChanged = false;
			}
			
			//Set up a new position variable and calculate the distance between the player and the next waypoint.
			var newPos;
			var distance = this.calcLineLength(this.position, this.keyframes[this.frameNum + 1].getPoint());
			
			//If the player is so close to the waypoint that to go forward by its speed would put it too far...
			if(distance < this.speed)
			{
				//...you've reached the next frame (for the next loop)...
				this.frameChanged = true;
				//...so the current frame is one further along...
				this.frameNum++;
				//...and you want to move forward only by the distance, not by the speed, along the line.
				newPos = new Point(distance*Math.cos(this.curAngle), distance*Math.sin(this.curAngle));
			}
			else
				//Otherwise, move forward by the speed of the player.
				newPos = new Point(this.speed*Math.cos(this.curAngle), this.speed*Math.sin(this.curAngle));
			
			//Make that the new position for the player.
			this.position.add(newPos);
		}
	},
	
	//Function to reset the player post-animation.
	resetIt : function()
	{
		this.frameNum = 0;
		this.frameChanged = true;
		this.curSlope = 0;
		this.position = new Point(this.keyframes[0].getPoint().getX(), this.keyframes[0].getPoint().getY());
	},
	
	//Function to package the player as a valid JSON string for saving purposes.
	save : function()
	{
		var playerJSON = {};
		
		//First, packages all the keyframes into an array.
		var playerKeyframesJSON = [];
		for(var i = 0; i < this.keyframes.length; i++)
		{
			playerKeyframesJSON[i] = this.keyframes[i].save();
		}
		var playerCollectedFramesJSON = {};
		playerCollectedFramesJSON['keyframes'] = playerKeyframesJSON;
		
		//Then packages the player's attributes and returns the bundle to the play.
		var playerBlockingJSON = {blocking : this.blocking};
		var playerInitialsJSON = {initials : this.initials};
		var playerSpeedJSON = {speed : this.speed};
		
		playerJSON = Object.merge(playerBlockingJSON, playerInitialsJSON, playerSpeedJSON, playerCollectedFramesJSON);
		
		return playerJSON;
	}
});