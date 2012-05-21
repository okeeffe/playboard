/* The functionality to hook into the Rails AJAX form calls in order to act on the response, 
with the help of functions provided by the Mootools rails.js implementation which exposes 
Rails 3's JavaScript AJAX hooks. */

window.addEvent('domready', function()
{
	//If the form is on the page, select it as an element for use so that we're not constantly selecting it from the DOM.
	var form = $('create_play_form');
	if(form)
	{
		//This section will handle errors in the event of a POST failure.
		form.addEvent('ajax:failure', function(xhr){
			//Can focus on name for now, as it is the only AJAX form field that can err on the AJAX-enabled Play Edit screen.
			var errors = JSON.decode(xhr.responseText).name;
			
			//Build up the error display HTML.
			var errorText = "<h2>There were errors with the submission:</h2> \n<ul>";
			errors.each(function(error)
			{
				errorText += "<li>Name : " + error + "</li> ";
			});
			errorText += "</ul>";

			//Grab the error explanation div and make it visible, setting its inner HTML to be the error list.
			if($('error_explanation'))
			{
				$('error_explanation').removeClass('invisible');
				$('error_explanation').set('html', errorText);

				//Highlight the name field as containing an error after grabbing all the divs on the page.
				var divs = $$('div');
				for(var i = 0; i < divs.length; i++)
				{
					if(divs[i].hasClass('field') && divs[i].get('html').search('<label for="play_name">Name</label>') != -1)
					{
						divs[i].addClass('field_with_errors').removeClass('field');						
						break;
					}
				}
			}
			//Flash the failure message.
			flash('failure');
		});
		//Else if the AJAX POST was a success...
		form.addEvent('ajax:success', function(xhr){
			//Turn the error explanation div invisible again.
			if(!$('error_explanation').hasClass('invisible'))
			$('error_explanation').addClass('invisible');

			//And turn the highlighted-as-errors fields back to normal.
			var divs = $$('div');
			for(var i = 0; i < divs.length; i++)
			{
				if(divs[i].hasClass('field_with_errors') && divs[i].get('html').search('<label for="play_name">Name</label>') != -1)
				{
					divs[i].addClass('field').removeClass('field_with_errors');						
					break;
				}
			}
			
			//Flash the success message.
			flash('success');
		});
	}

	//Function to make the flash messages come up on the AJAX play edit page. 
	//(Well the function could work on any page with AJAX but currently that is where it is used).
	var flash = function(result)
	{
		//Try to grab the flash messages div if it is already there.
		var flashMessage = $('flash_messages');
		
		//First pair of if statements cover the case where there has already been a flash message.
		if(flashMessage && result == 'failure')
		{
			//Set the inner HTML of the flash messages div to be the correct response, fade it in,
			//and then fade it out after 3 seconds for a nice effect.
			flashMessage.set('html', '<p class=error>Oops, there was a problem saving your play.</p>')
			flashMessage.fade('in');
			setTimeout(function() {flashMessage.fade('out')}, 3000);
		}
		else if(flashMessage && result == 'success')
		{
			flashMessage.set('html', '<p class=message>Play successfully saved.</p>')
			flashMessage.fade('in');
			setTimeout(function() {flashMessage.fade('out')}, 3000);
		}
		//The second pair create a new one if needed (i.e. the first time a flash message is displayed on the page).
		else if(result == 'failure')
		{
			flashMessage = new Element('div', {id : 'flash_messages'});
			flashMessage.set('html', '<p class=error>Oops, there was a problem saving your play.</p>')
			flashMessage.inject($('header'), 'after');
			flashMessage.fade('in');
			setTimeout(function() {flashMessage.fade('out')}, 3000);
		}
		else if(result == 'success')
		{
			flashMessage = new Element('div', {id : 'flash_messages'});
			flashMessage.set('html', '<p class=message>Play successfully saved.</p>')
			flashMessage.inject($('header'), 'after');
			flashMessage.fade('in');
			setTimeout(function() {flashMessage.fade('out')}, 3000);
		}
	}
});