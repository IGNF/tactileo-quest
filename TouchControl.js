/** TouchControl object to handle touch event / fallback for mouse event
*
* Copyright (c) 2014 by Jean-Marc.Viglino [at] ign.fr
* Licensed under the CeCILL-B Licence (http://www.cecill.info/).
*/
var TouchControl = Classe.extend(
{	// zindex
	zindex: -1,
	// Rotation factor
	rotationFac: 2,
	
	// Initialize the touchControl and create touch event handler and fallbacks for mouse event
	initialize: function(el, options)
	{	var self = this;
		if (!options) options = {};

		// The object
		this.$obj = $(el);
		this.$el = $(el).wrap("<div class='touchWrapper'></div>").parent();
		this.target = this.$el.get(0);

		// Object transform
		this.transfo =
		{	x: options.x ? options.x : 0, 
			y: options.y ? options.y : 0,
			scale: options.scale ? options.scale : 1,
			angle: options.angle ? options.angle : 0,
			zindex: options.zindex ? options.zindex : 0
		};
		
		// Last update
		this.delta =
		{	dx:0, dy:0,
			dscale:0,
			dangle:0
		};
		
		// Touch event list
		this.touches = {};
		this.touch = {};
		this.nbtouch = 0;
		
		// Y-ordering
		this.yorder = options.yorder;
		if (this.yorder) this.transfo.zindex = Math.round(this.transfo.y);
		else 
		{	if (options.zindex) TouchControl.prototype.zindex = options.zindex;
			else this.transfo.zindex = ++TouchControl.prototype.zindex;
		}
		
		// Listen touch events
		if (window.navigator.msPointerEnabled) 
		{	function e2event(e) { e.changedTouches = [e]; e.identifier=e.pointerId; console.log(e.identifier); return e; }
			this.target.addEventListener('MSPointerDown', function(e){ self.touchStart(e2event(e)); }, false);
			this.target.addEventListener('MSPointerMove', function(e){ self.touchMove(e2event(e)); }, false);
			this.target.addEventListener('MSPointerUp', function(e){ self.touchEnd(e2event(e)); }, false);
			this.target.addEventListener('MSPointerOut', function(e){ self.touchEnd(e2event(e)); }, false);
			this.target.addEventListener('MSPointerCancel', function(e){ self.touchEnd(e2event(e)); }, false);
		}
		else
		{	this.target.addEventListener('touchstart', function(e){ self.touchStart(e); }, false);
			this.target.addEventListener('touchmove', function(e){ self.touchMove(e); }, false);
			this.target.addEventListener('touchend', function(e){ self.touchEnd(e); }, false);
			this.target.addEventListener('touchcancel', function(e){ self.touchEnd(e); }, false);
		}
		
		function is_touch_device() 
		{	return (('ontouchstart' in window)
				  || (navigator.MaxTouchPoints > 0)
				  || (navigator.msMaxTouchPoints > 0));
		}
		
		// Mouse event fallbacks 
		if ( ! is_touch_device() )
		{	// Mouse event fallbacks click : simulate a new touch entry
			this.target.addEventListener('mousedown', function(e)
				{	e.changedTouches = [{ identifier:1, target:self.target, pageX:e.pageX, pageY:e.pageY }];
					self.mdown = true;
					self.touchStart(e); 
				}, false);

			// Mouse event fallbacks move : simulate a touch move or a nex touch entry if ctrl is pressed (hack for scale/rotation)
			$("body").get(0).addEventListener('mousemove', function(e)
				{	if (!self.mdown) return;
					e.changedTouches = [{ identifier:1, target:self.target, pageX:e.pageX, pageY:e.pageY }];
					if (e.ctrlKey)
					{	if (self.mCtrlKey) e.changedTouches.push(self.mCtrlKey);
						else 
						{	self.mCtrlKey = { identifier:2, target:self.target, pageX:e.pageX, pageY:e.pageY };
							e.changedTouches[0].identifier = 2;
							self.touchStart(e);
						}
					}
					else 
					{	if (self.mCtrlKey)
						{	e.changedTouches.push(self.mCtrlKey);
							self.touchEnd(e);
							self.mCtrlKey = false;
						}
					}
					self.touchMove(e);
				}, false);

			// Mouse event fallbacks up : remove touch entry
			$("body").get(0).addEventListener('mouseup', function(e)
				{	if (!self.mdown) return;
					e.changedTouches = [{ identifier:1, target:self.target, pageX:e.pageX, pageY:e.pageY }];
					self.mdown = false;
					if (self.mCtrlKey) e.changedTouches.push(self.mCtrlKey);
					self.touchEnd(e);
					self.mCtrlKey = false; 
				}, false);
		}

		// Add a tractor beam
		if (options.beam)
		{	this.beam =
			{	dx: 0,
				dy: 0,
				div: []
			}
		
			var css = 
			{	position: "absolute",
				"border-radius": "100px",
				background: "#999",
				border: "10px solid #ccc",
				opacity: 0.5,
				display: "none"
			};

			var radius = options.radius || 25;
			var tbeam = this.beam.div;
			for (var i=0; i<(options.nBeam||3); i++) 
				tbeam.push 
					(	$("<div>").addClass("touchCtrlBeam touchCtrlBeam_"+i)
						.css(css)
						.width (2*radius *(i>0 ? 0.8:1) )
						.height(2*radius *(i>0 ? 0.8:1) )
					);

			for (var i=0; i<tbeam.length; i++) tbeam[i].appendTo(this.$el);
		}

		// Callbacks
		this.onTouch = options.onTouch || function(){};
		this.onMove = options.onMove || function(){};
		this.onEnd = options.onEnd || function(){};

	},

	/** New touch : add a new entry in the touch table
	*/
	touchStart: function (event)
	{	var self = this;
		$.each (event.changedTouches,
			function(i,touch)
			{	self.touches[touch.identifier] =
					{	x0: this.pageX,
						y0: this.pageY,
						x1: this.pageX,
						y1: this.pageY
					};
				self.touch = { x: this.pageX, y: this.pageY };
				self.nbtouch++;
			});
		// Tractor beam
		if (self.beam)
		{	for (var i=0, l=self.beam.div.length; i<l; i++) self.beam.div[i].show();
			var pos = self.$obj.position();
			self.beam.dx = self.touch.x - pos.left - self.$obj.outerWidth()/2;
			self.beam.dy = self.touch.y - pos.top - self.$obj.outerHeight()/2;
		}

		//console.log(event.changedTouches.length+" - "+self.$el.attr("src"));
		// Callback
		self.onTouch();
		event.preventDefault();
	},

	/** End touch : remove the entry
	*/
	touchEnd: function (event)
	{	var self = this;
		//console.log(event.touches.length+" doigt"+(event.touches.length>1?"s":""));
		$.each (event.changedTouches,
			function(i,touch)
			{	delete( self.touches[touch.identifier] );
				self.touch = { x: this.pageX, y: this.pageY };
				self.nbtouch--;
				if (self.nbtouch<0) self.nbtouch = 0;
			});
		// Tractor beam
		if (self.beam)
		{	for (var i=0, l=self.beam.div.length; i<l; i++) self.beam.div[i].hide();
			self.beam.dx = self.beam.dy = 0;
		}
		//console.log(event.changedTouches.length+" - "+self.$el.attr("src"));
		// Callback
		self.onEnd();
		event.preventDefault();
	},

	/** Touch move : change the position of the touch
	*/
	touchMove: function (event)
	{	var self = this;
		// console.log(event.touches.length+" doigt"+(event.touches.length>1?"s":""));
		var ischanged = false;
		$.each (event.changedTouches,
			function(i,touch)
			{	var target = $(touch.target).parents(".touchWrapper").get(0);
				if (self.target === touch.target || self.target === target)
				{	if (self.touches[touch.identifier])
					{	self.touches[touch.identifier].x1 = this.pageX;
						self.touches[touch.identifier].y1 = this.pageY;
						self.touch = { x: this.pageX, y: this.pageY };
						ischanged = true;
					}
				}
			});
		if (ischanged)
		{	// Tractor beam
			if (self.beam)
			{	var pos = self.$obj.position();
				self.beam.dx = self.touch.x - pos.left - self.$obj.outerWidth()/2;
				self.beam.dy = self.touch.y - pos.top - self.$obj.outerHeight()/2;
			}

			// Calculate the new transformation for an object
			var transfo = self.transfo;
			switch (self.nbtouch)
			{	// Rotation / scale 
				case 2:
				{	var x0, y0, x1, y1, first=true;
					for (var t in self.touches)
					{	var d = self.touches[t];
						if (first)
						{	x0 = d.x0; y0 = d.y0;
							x1 = d.x1; y1 = d.y1;
							first = false;
						}
						else
						{	// Translation
							self.delta.dx = (x1+d.x1 - x0-d.x0) /2;
							self.delta.dy = (y1+d.y1 - y0-d.y0) /2;
							// Rotation / scale
							x0 -= d.x0; y0 -= d.y0;
							x1 -= d.x1; y1 -= d.y1;
							var d0 = Math.sqrt(x0*x0+y0*y0);
							var d1 = Math.sqrt(x1*x1+y1*y1);
							if (d0!=0 && d1!=0) 
							{	// New scale
								self.delta.dscale = d1/d0;
								// New angle
								self.delta.dangle = Math.asin(x0/d0*y1/d1-x1/d1*y0/d0)*this.rotationFac*180/Math.PI;
							}
							else
							{	self.delta.dangle = 0;
								self.delta.dscale = 1;
							}
							//
							break;
						}
					}
					break;
				}
				// Translation
				case 1:
				default:
				{	for (var t in self.touches)
					{	var d = self.touches[t];
						self.delta.dx = d.x1-d.x0;
						self.delta.dy = d.y1-d.y0;
						self.delta.dscale = 1;
						self.delta.dangle = 0;
						break;
					}
					break;
				}
			}
			// New Transfo
			self.transfo.x += self.delta.dx;
			self.transfo.y += self.delta.dy;
			self.transfo.scale *= self.delta.dscale;
			self.transfo.angle += self.delta.dangle;
			if (self.yorder) self.transfo.zindex = Math.round(self.transfo.y);
			else if (self.transfo.zindex != TouchControl.prototype.zindex) self.transfo.zindex = ++TouchControl.prototype.zindex;

			// Reset
			for (var t in self.touches)
			{	var d = self.touches[t];
				d.x0 = d.x1;
				d.y0 = d.y1;
			}

			// Callback
			self.onMove();
			// console.log(event.changedTouches.length+" - "+self.$el.attr("src"));
			event.preventDefault();
		}
	},

	/** Apply a new transform to an object via css
	*/
	cssTransform: function(obj, transfo)
	{	if (!obj) obj = this.$el;
		if (!transfo) transfo = this.transfo;
		// New transform
		var tr = "translate3D("+transfo.x+"px,"+transfo.y+"px, 0) "
				+ "scale("+transfo.scale+") "
				+ "rotate("+transfo.angle+"deg) "
				;
		obj.css(
		{ 	position:"absolute",
			"border-width":(10/transfo.scale)+"px",
			"z-index": transfo.zindex,
			"-webkit-transform":tr, 
			"-transform":tr, 
			"-webkit-transform-origin": transfo.origin || "50% 50%",
			"-transform-origin": transfo.origin || "50% 50%",
			"font-size": (1/transfo.scale)+"em"
		});
	},

	/** Draw the tractor beam
	*/
	renderBeam: function()
	{	if (!this.beam) return;
		var pos = 
		{	x: this.$obj.position().left + this.$obj.outerWidth()/2,
			y: this.$obj.position().top + this.$obj.outerHeight()/2
		}
		for (var i=0, l=this.beam.div.length; i<l; i++)
		{	var rad2 = this.beam.div[i].outerWidth()/2;
			this.beam.div[i].css({ top: ((l-i)*this.touch.y + i*pos.y)/l -rad2, left: ((l-i)*this.touch.x + i*pos.x)/l -rad2});
		}
	}
});
