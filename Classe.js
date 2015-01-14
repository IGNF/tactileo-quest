/** A simple class inheritance mecanism
* 
* Usage :
* - Define new children
*	var Children = Classe.extend ({ attributes, methods });
* - Access the parent prototype function f
*	this.parentPrototype.f.apply (this, args);
*
* Copyright (c) 2014 by Jean-Marc.Viglino [at] ign.fr
* Licensed under the Beerware license (http://en.wikipedia.org/wiki/Beerware),
* feel free to use and abuse it in your projects (the code, not the beer ;-).
*/
var Classe = function()
{	// Constructor
	if (this.initialize) this.initialize.apply(this, arguments);
};

Classe.extend = function (options) 
{	var parent = this;
	// Constructor for chidrens : apply parent's contructor
	var child = function() 
	{	return parent.apply(this, arguments);
	};
	// Add extend function to the chidren
	child.extend = parent.extend;
	// Copy parent's prototypes
	var Surrogate = function() {};
	Surrogate.prototype = parent.prototype;
	child.prototype = new Surrogate();
	/* Parent class reference for prototype callback 
	*	usage => this.parentPrototype.function.apply (this, args);
	*/
	child.prototype.parentPrototype = parent.prototype;
	// New prototypes
	for (var key in options) child.prototype[key] = options[key];
	// The new objet class
	return child;
}
