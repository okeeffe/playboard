window.addEvent('domready', function()
{
	//If the chalkboard is there we know we need the Play Engine and associated functionality.
	var board = $('chalkboard');
	if(board)
	{
		//If the instructions div is there (on the edit page)...
		if($('instructions'))
		{
			//Start the instructions hidden, but give them a fancy transition animation for their reveal.
			var slide = new Fx.Slide('instructions', {
				transition : Fx.Transitions.Quad.easeInOut
			}).hide();
			//When the toggleInstructions button is clicked, toggle the slide effect to reveal/hide them.
			$('toggleInstructions').addEvent('click', function(){
				slide.toggle();
			});
		}
		
		//Grab the authorisation token for the AJAX XHR's.
		var authToken = RAILS_AUTH_TOKEN;
		
		//Send the request to the server for play JSON, with the authorisation token.
		var jsonLoadRequest = new Request.JSON({
			url: document.location.href,
			//If successful...
			onSuccess: function(responseJSON, responseText)
			{
				//...parse the returned JSON.
				var loader = new JSONLoader(responseJSON);
				var loadedPlay = loader.returnPlay();
				//...set up the background image for the board.
				var chalk = new Image();
				//Following event necessary to ensure the image is loaded before the canvas is drawn (bugfix).
				chalk.addEvent('load', function(){
					//...once the image is loaded, set up the Chalkboard and set the main loop of it running.
					var chalkboard = new Chalkboard(board, authToken, chalk, {play : loadedPlay});
					setInterval(function() {chalkboard.mainLoop();}, 30);
				});
				chalk.src = "../../images/footballbg.jpg";				
			}
		}).get(authToken);
	}
});