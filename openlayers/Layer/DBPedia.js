/* Copyright (c) 2014 by Jean-Marc Viglino. 
* Published under the 2-clause BSD license. See license.txt in the OpenLayers 
* distribution or repository for the full text of the license. 
*/
/**
* @requires OpenLayers/Layer/Vector.js
*/

/**
* Class: OpenLayers.Layer.DBPedia
* A BDPedia layer type to load DBPedia located content in a vector layer.
*
* Inherits from:
* - <OpenLayers.Layer.Vector>
*/
OpenLayers.Layer.DBPedia = OpenLayers.Class(OpenLayers.Layer.Vector, 
{	/** Url for DBPedia sparql 
	*/
	url: "http://fr.dbpedia.org/sparql",
	dbStrategy: null,
	/**
	* Constructor: OpenLayers.Layer.BDPedia
	*
	* Parameters:
	* name - {String} The layer name.
	* options - {Object} Optional object with non-default properties to set on
	* the layer.
	*
	* Returns:
	* {<OpenLayers.Layer.BDPedia>} A new vector layer
	*/
	initialize: function(name, options) 
	{	if (!options) options = {};
		
		// Strategy for the layer
		var strategy = this.dbStrategy = new OpenLayers.Strategy.BBOX({ratio: 1, resFactor: 1.0});
		options.strategies = [ strategy ];
		// Projection = EPSG:4326
		options.projection = new OpenLayers.Projection("EPSG:4326");
		// Protocol to load the features
		options.protocol = new OpenLayers.Protocol.Script(
		{	url: options.url || this.url,
			callbackKey: "callback",
			//Custom format to handle dbpedia SPARQL results
			//format: new OpenLayers.Format.DbpediaFormat(),
			format: new OpenLayers.Format.JSON (
			{	read: function(data) 
				{	var bindings = data.results.bindings;
					var features = [];
					var lastfeature = false;
					for ( var i in bindings )
					{	var geometry = new OpenLayers.Geometry.Point(bindings[i].long.value, bindings[i].lat.value);		
						var att = bindings[i];
						att['name'] = bindings[i].label.value;
						att['desc'] = bindings[i].abs.value;
						var feature = new OpenLayers.Feature.Vector(geometry, att);
						if (lastfeature && lastfeature.attributes.subject.value == bindings[i].subject.value)
						{	// Garder la categorie dbpedia.org ?
							// if (bindings[i].cat.match ("dbpedia.org") lastfeature.attributes.cat = bindings[i].cat;
							// Concatener les categories
							lastfeature.attributes.cat.value += "\n" + bindings[i].cat.value;
						}
						else features.push(feature);
						lastfeature = features[features.length-1];
					}
					return features ;
				},
				write: function(object) { /* console.log(object); */ }
			}),
			params: { format: "json" },
			filterToParams: function(filter, params) 
			{	//BBOX serialization
				if (filter.type === OpenLayers.Filter.Spatial.BBOX) {
					var bbox = filter.value;
					// Voir http://fr.dbpedia.org/
					params.query = 
						"PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> "
//								+ "SELECT DISTINCT ?subject ?label ?abs ?thumb ?lat ?long WHERE { "
						+ "SELECT DISTINCT * WHERE { "
						+ "?subject geo:lat ?lat . "
						+ "?subject geo:long ?long . "
						+ "?subject rdfs:label ?label. "
						+ "OPTIONAL {?subject dbpedia-owl:thumbnail ?thumb}."
						+ "OPTIONAL {?subject dbpedia-owl:abstract ?abs} . "
						+ "OPTIONAL {?subject rdf:type ?cat} . "
						// Filtre sur la categorie
						// + "FILTER ( regex (?cat, 'Monument|Sculpture|Museum', 'i') ) ."
						+ "FILTER(xsd:float(?lat) <= " + bbox.top + " && " + bbox.bottom + " <= xsd:float(?lat) "
						+ "&& xsd:float(?long) <= " + bbox.right + " && " + bbox.left + " <= xsd:float(?long) "
						+ "&& lang(?label) = 'fr' "
						+ "&& lang(?abs) = 'fr' "
						+ ") . "
						+ "} LIMIT 1000";
				}
				return params;
			}
		});
		
		// Initialize the layer
		OpenLayers.Layer.Vector.prototype.initialize.apply(this, arguments);
		
	},

	// New functions
	activate: function()
	{	return this.dbStrategy.activate(); 
	},

	deactivate: function()
	{	return this.dbStrategy.deactivate(); 
	},
	load: function() 
	{	if (!this.dbStrategy.active) 
		{	this.dbStrategy.activate(); 
			this.dbStrategy.deactivate(); 
		} 
	},
	
	CLASS_NAME: "OpenLayers.Layer.DBPedia"
});