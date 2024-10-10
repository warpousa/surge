	/////* Start SURGE Javascript Customizations */////
	///////////////////////////////////////////////////
	// Misc.Inital DOM manipulation and/or alteration //
	document.querySelector('.credit').classList.remove();
	document.getElementById('header').classList.add('is-transparent');
	//////////////////////////////////////////////////
	// Assign random classes to specifc element(s) //
	let classes = new Array('bground1', 'bground2', 'bground3', 'bground4', 'bground5');
	let length = classes.length;
	let bgroundImage = document.querySelectorAll('.banner');
	bgroundImage.forEach(function(value) {
		value.classList.add(classes[Math.floor(Math.random() * length)]);
	});
	/////////////////////////////////////////////////
	// Function to apply transparency based on scroll position //
	function applyTransparency(pageYOffsetValue) {
		let header = document.getElementById('header');
		if (pageYOffsetValue < 400) {
			header.classList.add('is-transparent');
			header.classList.remove('not-transparent');
		} else {
			header.classList.remove('is-transparent');
			header.classList.add('not-transparent');
		}
	}
	/////////////////////////////////////////////////
	// When user scrolls down, hide the navbar. When user scrolls up, show the navbar //
	document.getElementById('header').classList.add('show-header');
	let prevScrollpos = window.pageYOffset;
	window.onscroll = function() {
		let currentScrollPos = window.pageYOffset;
		if (prevScrollpos > currentScrollPos) {
			document.getElementById('header').classList.add('show-header');
			document.getElementById('header').classList.remove('hide-header');
			applyTransparency(currentScrollPos);
		} else {
			document.getElementById('header').classList.add('hide-header');
			document.getElementById('header').classList.remove('show-header');
		}
		prevScrollpos = currentScrollPos;
	}
	///////////////////////////////////////////////////
	/////* End SURGE Javascript Customizations  *//////