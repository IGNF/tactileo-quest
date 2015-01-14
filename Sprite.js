/** Sprite object to handle sprite move
*
* Copyright (c) 2014 by Jean-Marc.Viglino [at] ign.fr
* Licensed under the CeCILL-B Licence (http://www.cecill.info/).
*/
var Sprite = TouchControl.extend
({ 	
	/** Step for walking animation */
	step:0,
	classe:"sprite sprite_walk_front_0",
	/** Time beetween animation call */
	walkTime: 0,
	/** Sped for walking animation */
	speed: 100,

	/** Initialization : create a new sprite in the container div
	*	
	*/
	initialize: function(id, container, options)
	{ 	var s = $("<div>").addClass("sprite sprite_walk_front_0")
					.attr("id",id)
					.appendTo($(container));
		this.parentPrototype.initialize.apply (this, [s, options]);
	} ,

	/** onTouch > select the sprite
	*/
	touchStart: function() 
	{	this.parentPrototype.touchStart.apply (this, arguments);
		this.$el.addClass("select");
	},

	/** onUp > unselect the sprite
	*/
	touchEnd: function() 
	{ 	this.parentPrototype.touchEnd.apply (this, arguments);
		this.$el.removeClass("select"); 
	},

	/** onChange : move the sprite and walk
	*/
	touchMove: function()
	{	this.parentPrototype.touchMove.apply (this, arguments);
		// Force no scale, no rotation
		this.transfo.angle = 0;
		this.transfo.scale = 1;
		// Find walk frame
		var t = new Date().getTime();
		if (t - this.walkTime > this.speed)
		{	var l = "front";
			if (Math.abs(this.delta.dx) > Math.abs(this.delta.dy))
			{	if (this.delta.dx > 0) l="right";
				else if (this.delta.dx < 0) l="left";
			}
			else
			{	if (this.delta.dy > 0) l="front";
				else if (this.delta.dy < 0) l="back";
			}
			this.step = (++this.step)%8;
			this.classe = "sprite sprite_walk_"+l+"_"+((this.step++)%8);
			this.walkTime = t;
		}
	},

	/** Render the sprite
	*/
	render: function()
	{	this.cssTransform();
		this.$obj.removeClass().addClass(this.classe);
	}
});
