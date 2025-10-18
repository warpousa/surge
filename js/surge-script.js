	/////* Start SURGE Javascript Customizations */////
	///////////////////////////////////////////////////
	// Misc.Initial DOM manipulation and/or alteration //
	document.querySelector('.credit').remove();
	document.getElementById('header').classList.add('is-transparent');
	//////////////////////////////////////////////////
	document.querySelectorAll('.omega-nav-menu li ul.sub-menu').forEach(submenu => {
		Object.assign(submenu.style, {
			display: "block",
			opacity: "1",
			left: "auto"
		});
	});	
	//////////////////////////////////////////////////
	// Assign random classes to specific element(s) //
	let classes = ['bground1', 'bground2', 'bground3', 'bground4', 'bground5'];
	document.querySelectorAll('.banner').forEach(banner => {
		banner.classList.add(classes[Math.floor(Math.random() * classes.length)]);
	});

	/////////////////////////////////////////////////
	// Function to apply transparency based on scroll position //
	function applyTransparency(pageYOffsetValue) {
		let header = document.getElementById('header');
		if (!header) return;
		if (pageYOffsetValue < 150) {
			header.classList.add('is-transparent');
			header.classList.remove('not-transparent');
		} else {
			header.classList.remove('is-transparent');
			header.classList.add('not-transparent');
		}
	}

	function setAria() {
		menuIcon.setAttribute('aria-expanded', menuIcon.classList.contains('active') ? 'true' : 'false');
	}

	function triggerSuperfishEvent(anchor, type) {
		if (!anchor || !anchor.parentElement) return;

		const parentLi = anchor.parentElement;

		const evt = new MouseEvent(type, {
			bubbles: true,
			cancelable: true,
			view: window
		});
		parentLi.dispatchEvent(evt);

		anchor.setAttribute('aria-expanded', type === 'mouseenter' ? 'true' : 'false');
	}

	/////////////////////////////////////////////////
	// When user scrolls down, hide the navbar. When user scrolls up, show the navbar //
	let prevScrollpos = window.pageYOffset;
	window.onscroll = function () {
		let currentScrollPos = window.pageYOffset;
		let header = document.getElementById('header');
		if (!header) return;
		if (prevScrollpos > currentScrollPos) {
			header.classList.add('show-header');
			header.classList.remove('hide-header');
			applyTransparency(currentScrollPos);
		} else {
			header.classList.add('hide-header');
			header.classList.remove('show-header');
		}
		prevScrollpos = currentScrollPos;
	};

	///////////////////////////////////////////////////
	// Div cover for background //
	const menu = document.querySelector('#menu-menu-1');
	const menuIcon = document.querySelector('#menu-icon.menu-icon');
	const content = document.querySelector('#content');
	let overlay = null;

	function bindOverlayDismiss(el) {
		if (!el) return;
		['click', 'mouseenter', 'touchstart'].forEach(evt => {
			el.addEventListener(evt, () => {
				fadeOutAndRemove(el);
			});
		});
	}

	function createOverlay() {
		if (!overlay) {
			overlay = Object.assign(document.createElement('div'), {
				className: 'bg-coverup',
				style: 'width:100%; height: 100vh; background: #b8b8b8b2; position: fixed; top: 0; z-index: 0; left: 0; opacity: 0;'
			});
			content.appendChild(overlay);
			fadeIn(overlay);
			bindOverlayDismiss(overlay);
		}
	}

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
				createOverlay();
			});
		});
	});

	menu.addEventListener('mouseleave', () => {
		if (overlay) fadeOutAndRemove(overlay);
	});

	if (menuIcon) {
		menuIcon.setAttribute("tabindex", "0");
		menuIcon.setAttribute("role", "button");
		menuIcon.setAttribute("aria-controls", "menu-icon");
		menuIcon.setAttribute("aria-expanded", "false");


		menuIcon.addEventListener('click', () => {
			setTimeout(() => {
				setAria();
				if (menuIcon.classList.contains('active')) {
					createOverlay();
				} else {
					if (overlay) fadeOutAndRemove(overlay);
				}
			}, 10);
		});

		menuIcon.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				setAria();
				e.preventDefault();
				menuIcon.click();
			}
		});
	}

	function updateBurgerAccessibility() {
		if (!menuIcon) return;

		if (window.innerWidth >= 1023) {
			menuIcon.setAttribute("tabindex", "-1"); // remove from tab order
			menuIcon.setAttribute("aria-hidden", "true"); // hide from screen readers
		} else {
			menuIcon.setAttribute("tabindex", "0"); // allow focus
			menuIcon.setAttribute("aria-hidden", "false"); // expose to screen readers
		}
	}

	// Run on load
	updateBurgerAccessibility();

	// Run on resize
	window.addEventListener("resize", updateBurgerAccessibility);

	document.querySelector('#menu-icon').addEventListener('click', () => {
		document.querySelector('.site-header').classList.toggle('menu-expanded');
	});

	document.addEventListener("DOMContentLoaded", () => {
		const menuIcon = document.getElementById("menu-icon");
		if (menuIcon && menuIcon.getAttribute("href") === "#") {
			menuIcon.removeAttribute("href");
		}
	});

	let clickEvent = ('ontouchstart' in window) ? 'touchstart' : 'click';
	document.addEventListener(clickEvent, function (e) {
		if (window.innerWidth < 1023 && e.target.classList.contains('bg-coverup')) {
			menuIcon.click();
		}
	});
	///////////////////////////////////////////////////
	// Desktop menu click-to-expand logic //
	(function () {
		const isDesktop = () => window.innerWidth >= 1023;
		const navMenu = document.querySelector('.omega-nav-menu');
		if (!navMenu) return;
		navMenu.querySelectorAll('li.menu-item-has-children > a').forEach(anchor => {
			anchor.addEventListener('click', function (e) {
				if (!isDesktop()) return;
				e.preventDefault();
				triggerSuperfishEvent(this, 'mouseenter');
			});

			anchor.addEventListener('focus', function () {
				if (!isDesktop()) return;
				triggerSuperfishEvent(this, 'mouseenter');

				const parentLi = this.parentElement;
				const submenu = parentLi.querySelector('ul.sub-menu');
				if (submenu) {
					Object.assign(submenu.style, {
						display: "block",
						opacity: "1",
						left: "auto"
					});
				}
			});

			anchor.addEventListener('keydown', function (e) {
				if (!isDesktop()) return;
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();					
					triggerSuperfishEvent(this, 'mouseenter');				

				}

				if (e.key === 'Escape') {
					e.preventDefault();
					triggerSuperfishEvent(this, 'mouseleave');
				}
			});
			const parentLi = anchor.parentElement;
			const submenu = parentLi.querySelector('ul.sub-menu');
			if (submenu) {
				Object.assign(submenu.style, {
					display: "block",
					opacity: "1",
					left: "auto"
				});
			}	
		});
	})();
	////////////////
	(function () {
		const navMenu = $('.omega-nav-menu');
		if (!navMenu.length) return;
	})();
	/////* End SURGE Javascript Customizations *///////
	///////////////////////////////////////////////////         