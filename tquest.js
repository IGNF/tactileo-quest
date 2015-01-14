/***********************************************************************\
*	 _____          _   _      _          ___                  _        *
*	|_   _|_ _  ___| |_(_) ___| | ___    / _ \ _   _  ___  ___| |_      *
*	  | |/ _` |/ __| __| |/ _ \ |/ _ \  | | | | | | |/ _ \/ __| __|     *
*	  | | (_| | (__| |_| |  __/ | (_) | | |_| | |_| |  __/\__ \ |_      * 
*	  |_|\__,_|\___|\__|_|\___|_|\___/   \__\_\\__,_|\___||___/\__|     * 
*																        * 
\***********************************************************************/
/*
	  /(_)\
	 | O O |
	/   v   \
	 \m---m/


  http://www.network-science.de/ascii/ => standard
*
* Copyright (c) 2014 by Jean-Marc.Viglino [at] ign.fr
* Licensed under the CeCILL-B Licence (http://www.cecill.info/).
*/

(function(){})()

// Prevent document bounce
document.addEventListener("touchmove", function(e) { e.preventDefault(); });

// shim layer with setTimeout fallback
if (!window.requestAnimationFrame)
{	window.requestAnimationFrame = (function()
	{	var rep =  window.webkitRequestAnimationFrame 
				|| window.mozRequestAnimationFrame 
				|| function( callback ){ window.setTimeout(callback, 1000 / 60); };
		return rep;
	})();
}

// Add a delete on input text
jQuery.fn.deletable = function()
{	return this.each(function()
	{	$(this). css({ border:0 })
		.wrap($('<span class="deletable" />'))
		.after
		(	$('<span/>').on ("click touchstart", function(e) 
			{	$(this).prev('input').val('').focus();
				e.preventDefault();
				e.stopPropagation();
			})
			.width(16).height(16)
			.css (
			{	display: 'inline-block', 
				cursor: 'pointer',
				'vertical-align': 'middle',
				background:"url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gwICgkrlE3VzgAAACRQTFRFAAAAM2aZM2aZM2aZM2aZM2aZM2aZM2aZM2aZM2aZM2aZ////SmCkvwAAAAt0Uk5TADVaW1xetba/xMwxe5JhAAAAAWJLR0QLH9fEwAAAAEJJREFUCNdjYMAEEQIMDIwtQEbXRAYGyWVAhuRKAcZZQA4DkASyGcBCYAGQEEQAwYBJwRXDtYMNXA5kmIOsKMJiNwCbExPXKL8wOwAAAABJRU5ErkJggg==') no-repeat center #fff" 
			})
		);
	})
};

/** Web application
*/
var wapp = (function()
{	var count=0;
	// Openlayers map
	var map,
	// DBPedia layer
		dbpedia, 
	// compas
		compas={},
	// Characters on the map
		perso={},
	// Render parchemin
		parchemin = false;
		parcheminTxt = false;

	/** Create DBPedia layer to the map
	*/
	function addLayerDBPedia (map)
	{	// Layer style
		var style = new OpenLayers.Style(
			{	externalGraphic:"${getThumb}",
				pointRadius:"20",
				cursor:"pointer"
			},
			{	context : 
				{	getThumb : function(feature)
					{	// if (feature.attributes['thumb']) return feature.attributes['thumb'];
						var th = "icon/star.png";
						if (feature.attributes['cat'])
						{	if (feature.attributes.cat.value.match("/Museum")) th =  "icon/scroll.png";
							else if (feature.attributes.cat.value.match("/Monument")) th = "icon/diamond.png";
							else if (feature.attributes.cat.value.match("/Sculpture")) th = "icon/statue.png";
							else if (feature.attributes.cat.value.match("/Religious")) th = "icon/pix.png";
							else if (feature.attributes.cat.value.match("/Castle")) th = "icon/key.png";
							else if (feature.attributes.cat.value.match("Water")) th = "icon/leaf.png";
							else if (feature.attributes.cat.value.match("Island")) th = "icon/leaf.png";
							else if (feature.attributes.cat.value.match("/Event")) th = "icon/flask.png";
							else if (feature.attributes.cat.value.match("/Artwork")) th = "icon/flask.png";
							else if (feature.attributes.cat.value.match("/Stadium")) th = "icon/heart.png";
							else if (feature.attributes.cat.value.match("/Place")) th = "icon/star.png";
						}
						feature.attributes.icon = th;
						return th;
					}
				}
			});

		var l = new OpenLayers.Layer.DBPedia("infos",
		{	styleMap : new OpenLayers.StyleMap(style)
		});
	
		return l;
	};

	/** Initialize the app
	*/
	function initialize()
	{	$("#about div").mCustomScrollbar({theme:"minimal-dark"});
		// New map
		wapp.map = map = new OpenLayers.Map.Geoportail(apiKey, "map", { allOverlays:false, controls:[] } );
		map.addGeoportailLayers ("GEOGRAPHICALGRIDSYSTEMS.ETATMAJOR40");
		map.addGeoportailLayers ("ORTHOIMAGERY.ORTHOPHOTOS");
		dbpedia = addLayerDBPedia(map);
		map.addLayer (dbpedia);
		dbpedia.deactivate();
		if (window.localStorage && localStorage['compas@lon'])
		{	map.setCenterAtLonlat([localStorage['compas@lon'], localStorage['compas@lat']], 15);
		}
		else map.setCenterAtLonlat([3.06, 50.64], 15);
		dbpedia.load();
		var wgs84 = new OpenLayers.Projection('EPSG:4326');
		// Layer switcher
		$("#ortho").on('touchstart click', function(e){ map.showLayers(/ORTHO/); $("#ortho").toggle(); $("#emajor").toggle(); e.preventDefault(); e.stopPropagation(); });
		$("#emajor").on('touchstart click', function(e){ map.showLayers(/MAJOR/); $("#ortho").toggle(); $("#emajor").toggle(); e.preventDefault(); e.stopPropagation(); });

		// Teleportation (geocoding)
		new SearchBar ("#teleporte .searchBar", map, 
			{ 	poi:true, adresse:true,
				callback: function(r,q)  
				{	if (r && r.length)
					{	var lonlat;
						if (q) lonlat = q.lonlat;
						else lonlat = r[0];
						// Teleport
						$(".sprite").parent().addClass("teleport");
						setTimeout (function() { $(".sprite").parent().removeClass("teleport"); }, 1000);
						map.setCenterAtLonlat([lonlat.lon, lonlat.lat ]);
						dbpedia.load();
						// Save position
						localStorage['compas@lon'] = lonlat.lon;
						localStorage['compas@lat'] = lonlat.lat;
					}
				}
			});
		$("#teleporte input").on("touchstart", function(){ $(this).focus(); });
		$("#teleporte input").deletable().attr("autocomplete","off").attr("autocorrect","off");

		// About
		$("#about .sceau").on('touchstart click', function(e){ $('#about').toggleClass('hidden'); e.preventDefault(); e.stopPropagation(); });
		$("#showAbout.sceau").on('touchstart click', function(e){ $('#about').toggleClass('hidden'); e.preventDefault(); e.stopPropagation(); });
	
		// Info on parchemin
		$("#parchemin .sceau").on('touchstart click', 
			function(e)
			{ 	$("#parchemin").removeClass("zoom-in");
				setTimeout (function(){ $("#parchemin").parent().hide(); }, 500);
				e.stopPropagation();
				e.preventDefault();
			});
		wapp.parchemin = parchemin = new TouchControl("#parchemin", 
		{ 	zindex:1000,
			x:20, y:40,
			onMove:function()
			{ 	//this.transfo.angle = 0; 
				this.transfo.scale = 1; 
				// this.transfo.zindex = 1000;
			}
		});
		// $("#parchemin").css("position","");
		// setTimeout (function(){ $("#parchemin").css("position","absolute"); }, 500);
		$("#parchemin").parent().hide();

		// Add a compas to move the map
		wapp.compas = compas = new TouchControl("#compas", { beam:true, onEnd: function(){ dbpedia.load(); } } );

		// Hero / deplacement
		var mx = $("#content").width()-100;
		var my = $("#content").height()-100;
		for (var id in { orc:1, robin:2, princess:3, sara:4 })
		{	perso[id] = new Sprite(id, "#content", 
				{	yorder:true, 
					x:Math.random() *mx, 
					y:Math.random() *my,
					// Find object on the map
					onEnd: function()
					{	var d = this.$el.width()/2 * map.getResolution();
						var ll = map.getLonLatFromPixel({ x:this.touch.x, y:this.touch.y });
						var pt = new OpenLayers.Geometry.Point(ll.lon, ll.lat );
						for (var i=0; i<dbpedia.features.length; i++)
						{	if (!dbpedia.features[i].style && dbpedia.features[i].geometry.distanceTo(pt)<d) 
							{	var att = dbpedia.features[i].attributes;
								//console.log(att);
								var cat = att.cat.value.split("\n");
								for (var c in cat) cat[c] = cat[c].replace(/.*\/(.*)$/,"$1");
				
								parcheminTxt = (att.thumb && !/Defaut/.test(att.thumb.value) ? "<img src='"+att.thumb.value+"'/>" : "")
									+ "<h2>"+att.name+"</h2>"
									+"<p class='cat'>"+cat.join("-")+"</p>"
									+"<p>"+att.desc+"</p>";
								dbpedia.features[i].style = new OpenLayers.Style({ display:"none" });
								return;
							}
						}
					}
				});
		}
		// Show the sprites
		$(".sprite").parent().addClass("teleport");
		setTimeout (function() { $(".sprite").parent().removeClass("teleport"); }, 1000);
		
		render();

		// iPad add to home screen menu
		addToHomescreen();
	};

	/** Render the app
	*/
	function render()
	{	// Main loop
		requestAnimationFrame(render);
	//$("#debug").text(count++);
		count++;
		// Move the map (and the caracters)
		if (compas.beam.dx!=0 || compas.beam.dy!=0)
		{	compas.renderBeam();
			var t = {};
			for (var i in perso)
			{	t[i] = map.getLonLatFromPixel({ x:perso[i].transfo.x , y:perso[i].transfo.y });
			}
			var pt = map.getPixelFromLonLat(map.getCenter());
			pt.x += compas.beam.dx/10;
			pt.y += compas.beam.dy/10 ;
			map.setCenter(map.getLonLatFromPixel(pt));
			// Move characters
			for (var i in perso)
			{	pt = map.getPixelFromLonLat(t[i]);
				perso[i].transfo.x = pt.x; 
				perso[i].transfo.y = pt.y; 
			}
		}
		// Show parchemin
		if (parcheminTxt)
		{	$("#parchemin .info").html(parcheminTxt);
			$("#parchemin").parent().show();
			setTimeout (function(){ $("#parchemin").addClass("zoom-in"); }, 100);
			dbpedia.redraw();
			parcheminTxt = false;
		}
		parchemin.cssTransform(); 
		// Move characters
		for (var i in perso)
		{	perso[i].render()
		}
	};

	/** Start the app
	*/
	$(document).ready(initialize);

	/** Export for debug */
	return { 
		map: map,
		perso: perso,
		compas: compas,
		parchemin: parchemin
	}

})();