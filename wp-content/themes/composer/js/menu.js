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
	const menuIcon = document.querySelector('#menu-icon.menu-icon');
	const content = document.querySelector('#content');
	let overlay = null;
	//let fadeTimer = null;
	function createOverlay() {
		if (!overlay) {
			overlay = Object.assign(document.createElement('div'), {
				className: 'bg-coverup',
				style: 'width:100%; height: 100vh; background: #b8b8b8b2; position: fixed; top: 0; z-index: 0; left: 0; opacity: 0;'
			});
			content.appendChild(overlay);
			fadeIn(overlay);
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
	menuIcon.addEventListener('click', () => {
		setTimeout(() => {
			if (menuIcon.classList.contains('active')) {
				createOverlay();
			} else {
				if (overlay) fadeOutAndRemove(overlay);
			}
		}, 10); // small delay to allow class toggle to complete
	});
	document.addEventListener("DOMContentLoaded", () => {
		const menuIcon = document.getElementById("menu-icon");
		if (menuIcon && menuIcon.getAttribute("href") === "#") {
			menuIcon.removeAttribute("href");
		}
	});		
    ///////////////////////////////////////////////////
	/////* End SURGE Javascript Customizations  *//////
})(jQuery, window);