	/////* Start SURGE Javascript Customizations */////
	///////////////////////////////////////////////////
	// surgeMenu.js
	(function () {
		'use strict';

		function assignRandomBannerClasses() {
			const classes = ['bground1', 'bground2', 'bground3', 'bground4', 'bground5'];
			document.querySelectorAll('.banner').forEach(banner => {
				banner.classList.add(classes[Math.floor(Math.random() * classes.length)]);
			});
		}

		function applyTransparency(pageYOffsetValue) {
			const header = document.getElementById('header');
			if (!header) return;

			if (pageYOffsetValue < 150) {
				header.classList.add('is-transparent');
				header.classList.remove('not-transparent');
			} else {
				header.classList.remove('is-transparent');
				header.classList.add('not-transparent');
			}
		}
		
		function initHeaderState() {
			document.addEventListener('DOMContentLoaded', () => {
				applyTransparency(window.pageYOffset);
			});
		}

		function initScrollHeaderBehavior() {
			let prevScrollpos = window.pageYOffset;
			window.addEventListener('scroll', () => {
				const currentScrollPos = window.pageYOffset;
				const header = document.getElementById('header');
				if (!header) return;

				const delta = Math.abs(currentScrollPos - prevScrollpos);

				if (delta < 10) return; // ignore micro scrolls

				if (prevScrollpos > currentScrollPos) {
					header.classList.add('show-header');
					header.classList.remove('hide-header');
					applyTransparency(currentScrollPos);
				} else {
					header.classList.add('hide-header');
					header.classList.remove('show-header');
				}
				prevScrollpos = currentScrollPos;
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

		// === Configurable Selectors ===
		const navMenuRoot = document.querySelector('#menu-menu-1');
		const menuIcon = document.querySelector('#menu-icon.menu-icon');
		const content = document.querySelector('#content');
		let overlay = null;

		// === Utility Functions ===
		function showSubmenu(submenu) {
			if (submenu) {
				Object.assign(submenu.style, {
					display: "block",
					opacity: "1",
					left: "auto"
				});
			}
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

		function bindOverlayDismiss(el) {
			if (!el) return;
			['click', 'mouseenter', 'touchstart'].forEach(evt => {
				el.addEventListener(evt, () => {
					fadeOutAndRemove(el);
				});
			});
		}

		function createOverlay(source = 'mouse') {
			if (!overlay) {
				overlay = Object.assign(document.createElement('div'), {
					className: 'bg-coverup',
					style: 'width:100%; height: 100vh; background: #b8b8b8b2; position: fixed; top: 0; z-index: 0; left: 0; opacity: 0;'
				});
				content.appendChild(overlay);
				fadeIn(overlay);
				if (source !== 'keyboard') {
					bindOverlayDismiss(overlay);
				}
			}
		}

		// === Initialization ===
		function initSubmenus() {
			document.querySelectorAll('.omega-nav-menu li ul.sub-menu').forEach(showSubmenu);
		}
		
		function initMenuIcon() {
			document.addEventListener("DOMContentLoaded", () => {
				if (menuIcon && menuIcon.getAttribute("href") === "#") {
					menuIcon.removeAttribute("href");
				}
			});
		}		

		function initOverlayTriggers() {
			navMenuRoot.querySelectorAll('a, button, li').forEach(el => {
				['mouseenter', 'click', 'touchstart'].forEach(evt => {
					el.addEventListener(evt, () => {
						createOverlay();
					});
				});
				el.addEventListener('focus', () => {
					createOverlay('keyboard');
				});
				el.addEventListener('blur', () => {
					setTimeout(() => {
						const active = document.activeElement;
						if (!navMenuRoot.contains(active) && active !== overlay) {
							if (overlay) fadeOutAndRemove(overlay);
						}
					}, 10);
				});
			});

			function setAria() {
				menuIcon.setAttribute('aria-expanded', menuIcon.classList.contains('active') ? 'true' : 'false');
			}		

			if (menuIcon) {
				menuIcon.addEventListener('click', () => {
					setTimeout(() => {
						setAria();
						const header = document.getElementById('header');
						if (menuIcon.classList.contains('active')) {
							createOverlay();
							if (header) {
								header.classList.remove('is-transparent');
								header.classList.add('not-transparent');
							}
						} else {
							if (overlay) fadeOutAndRemove(overlay);
							if (header) {
								applyTransparency(window.pageYOffset); // restore based on scroll
							}
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

			navMenuRoot.addEventListener('mouseleave', () => {
				if (overlay) fadeOutAndRemove(overlay);
			});
			
			document.addEventListener('focusin', (e) => {
				if (window.innerWidth < 1023 && !navMenuRoot.contains(e.target) && !menuIcon.contains(e.target)) {
					if (menuIcon.classList.contains('active')) {
						menuIcon.click(); // collapse menu
					}
				}
			});
			
			document.addEventListener('touchstart', (e) => {
				if (window.innerWidth < 1023 && !navMenuRoot.contains(e.target) && !menuIcon.contains(e.target)) {
					if (menuIcon.classList.contains('active')) {
						menuIcon.click(); // collapse menu
					}
				}
			});	
			
			document.addEventListener('click', (e) => {
				if (window.innerWidth < 1023 && !navMenuRoot.contains(e.target) && !menuIcon.contains(e.target)) {
					if (menuIcon.classList.contains('active')) {
						menuIcon.click();
					}
				}
			});
		}

		function initDesktopMenu() {
			const navMenuDesktop = document.querySelector('.omega-nav-menu');
			if (!navMenuDesktop) return;

			navMenuDesktop.addEventListener('focusout', function (e) {
				if (!navMenuDesktop.contains(e.relatedTarget)) {
					if (overlay) fadeOutAndRemove(overlay);
				}
			});

			navMenuDesktop.querySelectorAll('li.menu-item-has-children > a').forEach(anchor => {
				anchor.addEventListener('click', function (e) {
					if (window.innerWidth < 1023) return;

					if (!this.dataset.opened) {
						e.preventDefault();
						this.dataset.opened = 'true';
						triggerSuperfishEvent(this, 'mouseenter');
					} else {
						// Allow navigation
						this.removeAttribute('data-opened');
					}
				});

				anchor.addEventListener('focus', function () {
					if (window.innerWidth < 1023) return;
					triggerSuperfishEvent(this, 'mouseenter');
					createOverlay();
				});

				anchor.addEventListener('keydown', function (e) {
					if (window.innerWidth < 1023) return;
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						triggerSuperfishEvent(this, 'mouseenter');
						createOverlay('keyboard');
					}
					if (e.key === 'Escape') {
						e.preventDefault();
						triggerSuperfishEvent(this, 'mouseleave');
						this.removeAttribute('data-opened');
					}
				});
				
				anchor.addEventListener('blur', () => {
					anchor.removeAttribute('data-opened');
				});				

				const submenu = anchor.parentElement.querySelector('ul.sub-menu');
				if (submenu) showSubmenu(submenu);
			});
		}

		function initGlobalEscapeHandler() {
			document.addEventListener('keydown', function (e) {
				if (e.key === 'Escape' && overlay) {
					fadeOutAndRemove(overlay);
				}
			});
		}

		// === Run All ===
		assignRandomBannerClasses();
		initHeaderState();
		initSubmenus();
		initOverlayTriggers();
		initDesktopMenu();
		initGlobalEscapeHandler();
		initScrollHeaderBehavior();
		initMenuIcon();		
		updateBurgerAccessibility();
		window.addEventListener('resize', () => {
			applyTransparency(window.pageYOffset);
			updateBurgerAccessibility();
		});
	})();
	/////* End SURGE Javascript Customizations *///////
	///////////////////////////////////////////////////        