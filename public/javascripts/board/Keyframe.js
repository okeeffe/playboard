//Class to encapsulate the idea of a keyframe for use in animating the players.
var Keyframe = new Class
({
	Implements : Options,

	options : {
		curve :  0, //Degree of curve to the point from the previous one (0-1). Not yet implemented.
		stutter : false, //Whether or not there should be stutter (delay) to this keyframe. Not yet implemented.
		//The coordinates of the point.
		x : 0,
		y : 0
	},

	initialize : function(options)
	{
		this.setOptions(options);
		this.position = new Point(this.options.x, this.options.y);
	},

	/* ----------Getters and Setters---------- */

	setCurve : function(newCurve)
	{
		this.curve = newCurve;
	},
	
	getCurve : function()
	{
		if(this.curve)
			return this.curve;
		else
			return this.options.curve;
	},

	setPoint : function(newPoint)
	{
		this.position = newPoint;
	},
	
	getPoint : function()
	{
		return this.position;
	},
	
	setStutter : function(newStutter)
	{
		this.stutter = newStutter;
	},
	
	getStutter : function()
	{
		if(this.stutter)
			return this.stutter;
		else
			return this.options.stutter;
	},
	
	/* ----------Important Functions---------- */
	
	//Function to wrap up the keyframe as a tidy JSON object and return it.
	save : function()
	{
		//First gets the wrapped up point JSON representation.
		var pointSavings = this.position.save();
		var others = {curve : this.getCurve(), stutter : this.getStutter()}
		wrappedUp = Object.merge(others, pointSavings);
		
		return wrappedUp;
	}
});