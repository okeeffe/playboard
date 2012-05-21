//Simple class to create a standard point in 2D space.
var Point = new Class
({
	initialize : function(x, y)
	{
		this.xCo = x;
		this.yCo = y;
	},
	
	/* ----------Getters and Setters---------- */
	
	setPoint : function(point)
	{
		this.xCo = point.getX();
		this.yCo = point.getY();
	},
	
	getPoint : function()
	{
		var pt = [this.getX(), this.getY()];
		return pt;
	},
	
	setX : function(newX)
	{
		this.xCo = newX;
	},
	
	getX : function()
	{
		return this.xCo;
	},
	
	setY : function(newY)
	{
		this.yCo = newY;
	},
	
	getY : function()
	{
		return this.yCo;
	},
	
	equals : function(point)
	{
		return (this.getX() == point.getX() && this.getY() == point.getY());
	},
	
	/* ----------Important Functions---------- */
	
	//Function to add a point to another.
	add : function(point)
	{
		this.xCo += point.getX();
		this.yCo += point.getY();
	},
	
	//Function to override toString in order to print a point more easily.
	toString : function()
	{
		return this.xCo + ', ' + this.yCo;
	},
	
	//Function to package a point as a valid JSON string for saving purposes.
	save : function()
	{
		return {x : this.xCo, y : this.yCo};
	}
});