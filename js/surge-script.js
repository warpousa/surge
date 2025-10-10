	/////* Start SURGE Javascript Customizations */////
	///////////////////////////////////////////////////
	// Misc.Inital DOM manipulation and/or alteration //
	document.querySelector('.credit').remove();
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
		if (pageYOffsetValue < 150) {
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
	// Div cover for background //
	const menu = document.querySelector('#menu-menu-1');
	const content = document.querySelector('#content');
	let overlay = null;
	//let fadeTimer = null;
	function fadeIn(el) {
		let start = null;
		function step(ts) {
			if (!start) start = ts;
			let progress = ts - start;
			el.style.opacity = Math.min(progress / 500, 1);
			if (progress < 500) requestAnimationFrame(step);
		}
		requestAnimationFrame(step);
	}
	function fadeOutAndRemove(el) {
		let start = null;
		function step(ts) {
			if (!start) start = ts;
			let progress = ts - start;
			el.style.opacity = Math.max(1 - progress / 500, 0);
			if (progress < 500) {
				requestAnimationFrame(step);
			} else {
				el.remove();
				overlay = null;
			}
		}
		requestAnimationFrame(step);
	}
	menu.querySelectorAll('a').forEach(anchor => {
		['mouseenter', 'click', 'touchstart'].forEach(evt => {
			anchor.addEventListener(evt, () => {
				if (!overlay) {
					overlay = Object.assign(document.createElement('div'), {
						className: 'bg-coverup',
						style: 'width:100%; height: 100vh; background: #b8b8b8b2; position: fixed; top: 0; z-index: 0; left: 0; opacity: 0;'
					});
					content.appendChild(overlay);
					fadeIn(overlay);
				}
			});
		});
	});
	menu.addEventListener('mouseleave', () => {
		if (overlay) fadeOutAndRemove(overlay);
	});
    ///////////////////////////////////////////////////
	/////* End SURGE Javascript Customizations  *//////