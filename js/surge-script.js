	/////* Start SURGE Javascript Customizations */////
    ///////////////////////////////////////////////////
    // Misc.Inital DOM manipulation and/or alteration //
	document.querySelector('.credit').classList.remove();
	document.getElementById('header').classList.add('is-transparent');
	//////////////////////////////////////////////////

	// Assign random classes to specifc element(s) //
	let classes = new Array ('bground1', 'bground2', 'bground3', 'bground4', 'bground5');
	let length  = classes.length;
	let bgroundImage = document.querySelectorAll('.banner');
	bgroundImage.forEach(function(value) {
		value.classList.add(classes[Math.floor(Math.random() * length)]);
	});	
	/////////////////////////////////////////////////
	
	// When user scrolls down, hide the navbar. When user scrolls up, show the navbar //
	document.getElementById('header').classList.add('show-header');
	let prevScrollpos = window.pageYOffset;

	window.onscroll = function() {		
		let currentScrollPos = window.pageYOffset;
		if (prevScrollpos > currentScrollPos) {
			document.getElementById('header').classList.add('show-header');
			document.getElementById('header').classList.remove('hide-header');
			let pageYOffsetValue = window.pageYOffset;

			function applyTransparency() {
				let applyTransparrency = (pageYOffsetValue < 400) ?  
					document.getElementById('header').classList.add('is-transparent') : document.getElementById('header').classList.remove('is-transparent');
			}	
			applyTransparency();
		} else {
			document.getElementById('header').classList.add('hide-header');
			document.getElementById('header').classList.remove('show-header');
		}
		prevScrollpos = currentScrollPos;
	}
	///////////////////////////////////////////////////
	/////* End SURGE Javascript Customizations  *//////