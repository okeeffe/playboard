var Chalkboard = new Class
({
	Implements : [Options, Events],
	
	options : {
		play : new Play(),
		/*
		onClick : $empty,
		onMouseDown : $empty
		contextMenu : $empty
		onKeyDown : $empty
		*/
	},
	
	changed : false,
	adding : true,
	animating : false,
	animationSteps : 0,
	
	//Chose to make canvas a required parameter as without a canvas this
	//class is effectively useless. When it comes to hooking in with Rails,
	//the authToken embedded in the page is equally as necessary, and the
	//background image is needed as a parameter as it can't be displayed until
	//it is loaded, which is handled in the Main.js.
	initialize : function(canvas, authToken, bgImage, options)
	{
		this.setOptions(options);
		if(canvas && canvas.getContext)
		{			
			this.canvas = canvas;
			this.context = this.canvas.getContext('2d');
			
			//Style the canvas drawings.
			this.context.lineWidth = 3;
			this.context.lineJoin = 'miter';
			this.context.strokeStyle = '#eee';
			this.chalk = bgImage;
			this.context.font = 'bold 15px sans-serif';
			this.context.textAlign = 'center';
			
			this.WIDTH = this.canvas.width;
			this.HEIGHT = this.canvas.height;
			
			//Instantiate the play and tell it how wide and tall the board is.
			this.play = this.options.play;
			this.play.setWidth(this.WIDTH);
			this.play.setHeight(this.HEIGHT);
						
			//Add necessary events.
			document.addEvent('keydown', this.onKeyDown.bind(this));
			$('playButton').addEvent('click', this.animate.bind(this));
			
			//If on the edit URL for the play...
			if(document.location.href.search("edit") != -1)
			{
				//Make the board area editable.
				this.editMode = true;
				
				//Add the events to change Play Engine parameters based on the forms.
				$('play_num_players').addEvent('change', this.changeNumPlayers.bind(this));
				$('play_play_type').addEvent('change', this.changeNumPlayers.bind(this));
				
				//The following event is there to ensure that the Play JSON only gets saved if there is not a problem
				//with the parameters given by the form.
				$('create_play_form').addEvent('ajax:success', this.save.bind(this));
				$('infoBox').addEvent('change', this.changeToDetails.bind(this));
				
				//Add the events to make the canvas respond to user interaction.
				this.canvas.addEvent('click', this.onClick.bind(this));
				this.canvas.addEvent('mousedown', this.onMouseDown.bind(this));
				this.canvas.addEvent('contextmenu', this.onRightClick.bind(this));
				
				//And set it up to save automatically every two minutes.
				setInterval(function() { $('play_submit').click(); }, 120000);
			}
			else
			{
				//Else on the Show view, which is non-editable.
				this.editMode = false;
			}
			
			//Add authToken for AJAX
			this.authToken = authToken;
			
			//Set this to true once everything is loaded so that the canvas draws itself.
			this.changed = true;
		}
		else
		{
			alert('No canvas object detected!');
			return;
		}
	},
	
	//The main loop of the canvas, inspired by game loops.
	mainLoop : function()
	{
		//We only want to redraw the board if something has changed.
		if(this.changed)
		{
			//Make changed false so that we don't needlessly redraw.
			this.changed = false;
			//If animation is in progress...
			if(this.animating)
			{
				//Prevent clicks from adding players.
				this.adding = false;
				this.changed = true;
				//Call animate on the play.
				this.play.animate();
				//Decrement the number of steps remaining in the animation.
				this.animationSteps--;
				
				//Once animation is over, reset everything.
				if(this.animationSteps <= 0)
				{
					this.adding = true;
					this.animating = false;
					this.play.resetIt();
				}
			}
			//Once everything has been processed, redraw the board.
			this.draw();
		}
	},
	
	/* ----------Event Handlers---------- */
	//All the events set changed to true, as they are things that change what is on the canvas
	//and necessitate a redraw.
	
	changeNumPlayers : function(evt)
	{
		this.play.changeNumPlayers(evt);
		
		this.changed = true;
	},
	
	changePlayType : function(evt)
	{
		this.play.changePlayType(evt);
		
		this.changed = true;
	},
	
	changeToDetails : function(evt)
	{
		this.changed = true;
	},
	
	onClick : function(evt)
	{
		if(!evt.rightClick)
		{
			this.play.clicked(this.getCursorPosition(evt), this.adding);
			
			this.changed = true;
		}
	},
	
	onRightClick : function(evt)
	{
		if(document.activeElement == this.canvas)
		{
			//Stop the default for that event.
			evt.stop();
			this.play.order(this.getCursorPosition(evt));

			this.changed = true;
		}
	},
	
	//Handles all keyDown events.
	onKeyDown : function(evt)
	{
		//If backspace is pressed, the canvas has focus and edit mode is on, call delete on a play.
		if(evt.key === 'backspace' && document.activeElement === this.canvas && this.editMode === true)
		{
			evt.stop();
			this.play.delete();
			
			this.changed = true;
		}
		//If spacebar is pressed and the canvas has focus, call animate.
		if(evt.key === 'space' && document.activeElement === this.canvas)
		{
			evt.stop();
			
			this.animate();
		}
		//If ctrl and s are pressed and edit mode is on, trigger the click event on the play submit button,
		//which sends the form contents via AJAX, and if successful, sends the play JSON immediately after.
		if(evt.control && evt.code === '83' && this.editMode === true)
		{
			evt.stop();
			$('play_submit').click();
		}
		//If escape is pressed, the canvas has focus and edit mode is on, deselect the currently selected player.
		if(evt.key === 'esc' && document.activeElement === this.canvas && this.editMode === true)
		{
			evt.stop();
			this.play.setSelectedPlayer(null);
		}
	},
	
	onMouseDown : function(evt)
	{
		if(!evt.rightClick)
		{
			this.play.mouseDown(this.getCursorPosition(evt));
			//Add the handlers for these events that are only needed after a mousedown.
			this.canvas.addEvent('mouseup', this.onMouseUp.bind(this));
			this.canvas.addEvent('mousemove', this.onDrag.bind(this));
			this.canvas.addEvent('mouseout', this.onMouseOut.bind(this));
			
			this.changed = true;
		}
	},
	
	onDrag :function(evt)
	{
		this.play.moveElement(this.getCursorPosition(evt));
		
		this.changed = true;
	},
	
	onMouseUp : function(evt)
	{
		//When the mouse button is released, remove those events.
		this.canvas.removeEvent('mousemove', this.onDrag.bind(this));
		this.canvas.removeEvent('mouseup', this.onMouseUp.bind(this));
		this.canvas.removeEvent('mouseout', this.onMouseOut.bind(this));
		
		this.play.mouseUp(this.getCursorPosition(evt));
		
		this.changed = true;
	},
	
	onMouseOut : function(evt)
	{
		//This performs the equivalent of a mouseUp event.
		this.onMouseUp(evt);
		this.changed = true;
	},
	
	/* ----------Other Functions---------- */

	//Function to handle getting the offsetted cursor position in all browsers.
	//This is necessary in order to get the position only in relation to the
	//canvas itself, not the entire page.
	getCursorPosition : function(evt)
	{
		var x, y;
		if(evt.page.x || evt.page.y)
		{
			x = evt.page.x;
			y = evt.page.y;
		}
		else
		{
			x = evt.client.x + document.body.scrollLeft +
           		document.documentElement.scrollLeft;
      		y = evt.client.y + document.body.scrollTop +
           		document.documentElement.scrollTop;
		}
		x -= this.canvas.offsetLeft;
		y -= this.canvas.offsetTop;

		return new Point(x, y);
	},
	
	//A function to get the correct URL for the POSTs if on the edit page.
	getCorrectURL : function()
	{
		var thePostURL = document.location.href;
		if(thePostURL.search("edit"))
		{
			thePostURL = thePostURL.slice(0, thePostURL.search("edit"));
		}
		
		return thePostURL;
	},
	
	//A function to animate the play.
	animate : function()
	{
		//Only works if not currently animating (bugfix).
		if(!this.animating)
		{
			//Get the amount of animation steps from the play and add 30, for the slight delay
			//before the play is reset.
			this.animationSteps = this.play.calcAnimationSteps() + 30;
			this.animating = true;

			this.changed = true;
		}
	},
	
	//The function to send the JSON play representation to the server.
	save : function()
	{
		var thePostURL = this.getCorrectURL();
		
		//A new JSON request is created.
		var jsonSaveRequest = new Request.JSON({
			url: thePostURL,
			//The data sent is the play data (saved by itself) and the authenticity token.
			data: {play_json : this.play.save(), authenticity_token : this.authToken},
			//On failure, alert why.
			onFailure : function(responseText)
			{
				alert(responseText);
			}}).put();
	},
	
	//Function to clear the canvas.
	clearBoard : function()
	{
		//Redraw the background image.
		this.context.drawImage(this.chalk, 0, 0);
	},
	
	//The draw functionality, rendering the canvas.
	draw : function()
	{
		//First, clear the canvas.
		this.clearBoard();
		//Then, get the play to draw itself to the context.
		this.play.draw(this.context);
	}
});