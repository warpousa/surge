/*
 * jQuery Superfish Menu Plugin
 * Copyright (c) 2013 Joel Birch
 *
 * Dual licensed under the MIT and GPL licenses:
 *	http://www.opensource.org/licenses/mit-license.php
 *	http://www.gnu.org/licenses/gpl.html
 */

(function ($, w) {
	"use strict";

	var methods = (function () {
		// private properties and methods go here
		var c = {
				bcClass: 'sf-breadcrumb',
				menuClass: 'sf-js-enabled',
				anchorClass: 'sf-with-ul',
				menuArrowClass: 'sf-arrows'
			},
			ios = (function () {
				var ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
				if (ios) {
					// iOS clicks only bubble as far as body children
					$(w).load(function () {
						$('body').children().on('click', $.noop);
					});
				}
				return ios;
			})(),
			wp7 = (function () {
				var style = document.documentElement.style;
				return ('behavior' in style && 'fill' in style && /iemobile/i.test(navigator.userAgent));
			})(),
			unprefixedPointerEvents = (function () {
				return (!!w.PointerEvent);
			})(),
			toggleMenuClasses = function ($menu, o) {
				var classes = c.menuClass;
				if (o.cssArrows) {
					classes += ' ' + c.menuArrowClass;
				}
				$menu.toggleClass(classes);
			},
			setPathToCurrent = function ($menu, o) {
				return $menu.find('li.' + o.pathClass).slice(0, o.pathLevels)
					.addClass(o.hoverClass + ' ' + c.bcClass)
						.filter(function () {
							return ($(this).children(o.popUpSelector).hide().show().length);
						}).removeClass(o.pathClass);
			},
			toggleAnchorClass = function ($li) {
				$li.children('a').toggleClass(c.anchorClass);
			},
			toggleTouchAction = function ($menu) {
				var msTouchAction = $menu.css('ms-touch-action');
				var touchAction = $menu.css('touch-action');
				touchAction = touchAction || msTouchAction;
				touchAction = (touchAction === 'pan-y') ? 'auto' : 'pan-y';
				$menu.css({
					'ms-touch-action': touchAction,
					'touch-action': touchAction
				});
			},
			applyHandlers = function ($menu, o) {
				var targets = 'li:has(' + o.popUpSelector + ')';
				if ($.fn.hoverIntent && !o.disableHI) {
					$menu.hoverIntent(over, out, targets);
				}
				else {
					$menu
						.on('mouseenter.superfish', targets, over)
						.on('mouseleave.superfish', targets, out);
				}
				var touchevent = 'MSPointerDown.superfish';
				if (unprefixedPointerEvents) {
					touchevent = 'pointerdown.superfish';
				}
				if (!ios) {
					touchevent += ' touchend.superfish';
				}
				if (wp7) {
					touchevent += ' mousedown.superfish';
				}
				$menu
					.on('focusin.superfish', 'li', over)
					.on('focusout.superfish', 'li', out)
					.on(touchevent, 'a', o, touchHandler);
			},
			touchHandler = function (e) {
				var $this = $(this),
					$ul = $this.siblings(e.data.popUpSelector);

				if ($ul.length > 0 && $ul.is(':hidden')) {
					$this.one('click.superfish', false);
					if (e.type === 'MSPointerDown' || e.type === 'pointerdown') {
						$this.trigger('focus');
					} else {
						$.proxy(over, $this.parent('li'))();
					}
				}
			},
			over = function () {
				var $this = $(this),
					o = getOptions($this);
				clearTimeout(o.sfTimer);
				$this.siblings().superfish('hide').end().superfish('show');
			},
			out = function () {
				var $this = $(this),
					o = getOptions($this);
				if (ios) {
					$.proxy(close, $this, o)();
				}
				else {
					clearTimeout(o.sfTimer);
					o.sfTimer = setTimeout($.proxy(close, $this, o), o.delay);
				}
			},
			close = function (o) {
				o.retainPath = ($.inArray(this[0], o.$path) > -1);
				this.superfish('hide');

				if (!this.parents('.' + o.hoverClass).length) {
					o.onIdle.call(getMenu(this));
					if (o.$path.length) {
						$.proxy(over, o.$path)();
					}
				}
			},
			getMenu = function ($el) {
				return $el.closest('.' + c.menuClass);
			},
			getOptions = function ($el) {
				return getMenu($el).data('sf-options');
			};

		return {
			// public methods
			hide: function (instant) {
				if (this.length) {
					var $this = this,
						o = getOptions($this);
					if (!o) {
						return this;
					}
					var not = (o.retainPath === true) ? o.$path : '',
						$ul = $this.find('li.' + o.hoverClass).add(this).not(not).removeClass(o.hoverClass).children(o.popUpSelector),
						speed = o.speedOut;

					if (instant) {
						$ul.show();
						speed = 0;
					}
					o.retainPath = false;
					o.onBeforeHide.call($ul);
					$ul.stop(true, true).animate(o.animationOut, speed, function () {
						var $this = $(this);
						o.onHide.call($this);
					});
				}
				return this;
			},
			show: function () {
				var o = getOptions(this);
				if (!o) {
					return this;
				}
				var $this = this.addClass(o.hoverClass),
					$ul = $this.children(o.popUpSelector);

				o.onBeforeShow.call($ul);
				$ul.stop(true, true).animate(o.animation, o.speed, function () {
					o.onShow.call($ul);
				});
				return this;
			},
			destroy: function () {
				return this.each(function () {
					var $this = $(this),
						o = $this.data('sf-options'),
						$hasPopUp;
					if (!o) {
						return false;
					}
					$hasPopUp = $this.find(o.popUpSelector).parent('li');
					clearTimeout(o.sfTimer);
					toggleMenuClasses($this, o);
					toggleAnchorClass($hasPopUp);
					toggleTouchAction($this);
					// remove event handlers
					$this.off('.superfish').off('.hoverIntent');
					// clear animation's inline display style
					$hasPopUp.children(o.popUpSelector).attr('style', function (i, style) {
						return style.replace(/display[^;]+;?/g, '');
					});
					// reset 'current' path classes
					o.$path.removeClass(o.hoverClass + ' ' + c.bcClass).addClass(o.pathClass);
					$this.find('.' + o.hoverClass).removeClass(o.hoverClass);
					o.onDestroy.call($this);
					$this.removeData('sf-options');
				});
			},
			init: function (op) {
				return this.each(function () {
					var $this = $(this);
					if ($this.data('sf-options')) {
						return false;
					}
					var o = $.extend({}, $.fn.superfish.defaults, op),
						$hasPopUp = $this.find(o.popUpSelector).parent('li');
					o.$path = setPathToCurrent($this, o);

					$this.data('sf-options', o);

					toggleMenuClasses($this, o);
					toggleAnchorClass($hasPopUp);
					toggleTouchAction($this);
					applyHandlers($this, o);

					$hasPopUp.not('.' + c.bcClass).superfish('hide', true);

					o.onInit.call(this);
				});
			}
		};
	})();

	$.fn.superfish = function (method, args) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		}
		else if (typeof method === 'object' || ! method) {
			return methods.init.apply(this, arguments);
		}
		else {
			return $.error('Method ' +  method + ' does not exist on jQuery.fn.superfish');
		}
	};

	$.fn.superfish.defaults = {
		popUpSelector: 'ul,.sf-mega', // within menu context
		hoverClass: 'sfHover',
		pathClass: 'overrideThisToUse',
		pathLevels: 1,
		delay: 800,
		animation: {opacity: 'show'},
		animationOut: {opacity: 'hide'},
		speed: 'normal',
		speedOut: 'fast',
		cssArrows: true,
		disableHI: false,
		onInit: $.noop,
		onBeforeShow: $.noop,
		onShow: $.noop,
		onBeforeHide: $.noop,
		onHide: $.noop,
		onIdle: $.noop,
		onDestroy: $.noop
	};
	///////////////////////////////////////////////////	
	/////* Start SURGE Javascript Customizations */////
	///////////////////////////////////////////////////
	(function () {
		'use strict';
		function removeCredits() {
			document.querySelector('p.credit').remove();
		}
        function wrapExceptFirstLetters(selector, style = 'opacity:0.75') {
          const element = document.querySelector(selector);
          if (!element) return;
          const words = element.textContent.split(/(\s+)/);
          const transformed = words.map(word => {
            if (/^\s+$/.test(word)) return word;
            const firstLetter = word.charAt(0);
            const remainder = word.slice(1);
            if (remainder.length > 0) {
              return firstLetter + `<span style="${style}">${remainder}</span>`;
            } else {
              return firstLetter; // single-letter word case
            }
          });
          element.innerHTML = transformed.join('');
        }
		function assignRandomBannerClasses() {
			const classes = ['bground1', 'bground2', 'bground3', 'bground4', 'bground5','bground6','bground7','bground8','bground9','bground10','bground11','bground12','bground13','bground14','bground15','bground16','bground17','bground18','bground19','bground20'];
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
					const isKeyboardClick = e.detail === 0; // detail === 0 means keyboard-triggered
					if (!this.dataset.opened && !isKeyboardClick) {
						e.preventDefault();
						this.dataset.opened = 'true';
						triggerSuperfishEvent(this, 'mouseenter');
					} else {
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
					if (e.key === ' ') {
						e.preventDefault(); // Space toggles submenu
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
        wrapExceptFirstLetters('h1.banner-title.site-description'); 
		initHeaderState();
		initSubmenus();
		initOverlayTriggers();
		initDesktopMenu();
		initGlobalEscapeHandler();
		initScrollHeaderBehavior();
		initMenuIcon();
		removeCredits();
		updateBurgerAccessibility();
		window.addEventListener('resize', () => {
			applyTransparency(window.pageYOffset);
			updateBurgerAccessibility();
		});
	})();
	///////////////////////////////////////////////////
	/////* End SURGE Javascript Customizations *///////
	///////////////////////////////////////////////////                          
})(jQuery, window);