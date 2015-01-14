/*
	Copyright (c) 2013 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
	
	OpenLayers.Map.Geoportail : IGN's Geoportail Map definition
	OpenLayers.Layer.Geoportail : IGN's Geoportail WMTS layer definition
*/

/** Class: OpenLayers.Map.Geoportail
*	Instances of a Geoportail Map.
*
*	Inherits from:
*	- <OpenLayers.Map>
*/ 
OpenLayers.Map.Geoportail = OpenLayers.Class(OpenLayers.Map,
{	/**	APIProperty: apiKey
	*	Geoportail API key, used to add new Geoportail layers
	*/
	gppKey:null,
	
	/** Constructor: OpenLayers.Map.Geoportail
	*	Create a new Geoportail Map.
	*
	*	Parameters:
	*	key - {String} API key
	*	div - {DOMElement|String}  The element or id of an element in your page
	*		that will contain the map.  May be omitted if the <div> option is
	*		provided or if you intend to call the <render> method later.
	*	options - {Object} Optional object with properties to tag onto the map.
	*/
	initialize: function (apiKey, div, options)
	{	if (!options) options={};
		//options = OpenLayers.Util.extend( { projection:"EPSG:3857" }, options);
		options = OpenLayers.Util.extend( { projection:"EPSG:900913" }, options);
		this.gppKey = apiKey;
		OpenLayers.Map.prototype.initialize.apply(this, [div, options]);
	},
	
	/** APIMethod: setCenterAtLonlat
    *	Set the map center (and optionally, the zoom level).
	*	Parameters:
	*	lonlat - {<OpenLayers.LonLat>} The new center location in EPSG:4326 projection.
	*     If provided as array, the first value is the x coordinate, and the 2nd value is the y coordinate.
	*	  If provides as array(4), suppose to be a bbox
	*	zoom - {Integer} Optional zoom level.
	*/
	setCenterAtLonlat: function (lonlat, zoom)
	{	// extend
		if (lonlat && lonlat.length==4)
		{	var l1 = new OpenLayers.LonLat([lonlat[0],lonlat[1]]);
			var l2 = new OpenLayers.LonLat([lonlat[2],lonlat[3]]);
			var t = new OpenLayers.Projection('EPSG:4326');
			l1.transform(t, this.getProjectionObject());
			l2.transform(t, this.getProjectionObject());
			this.zoomToExtent ([Math.min(l1.lon,l2.lon),Math.min(l1.lat,l2.lat),Math.max(l1.lon,l2.lon),Math.max(l1.lat,l2.lat)]);
		}
		// Centrer
		else
		{	if (lonlat != null && !(lonlat instanceof OpenLayers.LonLat)) 
				lonlat = new OpenLayers.LonLat(lonlat);
			if (zoom) zoom = zoom-(this.baseLayer ? this.baseLayer.minZoom : 0);
			this.setCenter (lonlat.transform(new OpenLayers.Projection('EPSG:4326'), this.getProjectionObject()), zoom);
		}
	},

	/** APIMethod: getCenterLonlat
    *	Get the map center.
	*	Return:
	*	lonlat - {<OpenLayers.LonLat>} The center location in EPSG:4326 projection.
	*/
	getCenterLonlat: function ()
	{	var lonlat = this.getCenter().clone();
		return lonlat.transform(this.getProjectionObject(),new OpenLayers.Projection('EPSG:4326'));
	},
	
    /** APIMethod: addGeoportailLayers 
    *	Add OpenLayers.Layer.Geoportail to the map
    *	Parameters:
    *	layers - {<String>|Array(<String>)} 
    *	options - 
    */
    addGeoportailLayers : function (layers, options)
	{	if (typeof(layers)=='string') layers = [layers];
		for (var i=0; i<layers.length; i++)
			this.addLayer (new OpenLayers.Layer.Geoportail (layers[i], options));
	},
	
	/** APIMethod: showLayers
	*	Show a layer or a group of layers in a regexp
    *	Parameters:
	*	- layers : {<String>|<RegExp>)} 
	*	- classname :  {<String>|<RegExp>)} 
	*/
	showLayers: function (layers, classname)
	{	if (!classname) classname=/Geoportail/;
		for (var i=0; i<this.layers.length; i++) 
		{	if (this.layers[i].CLASS_NAME.match(classname)) this.layers[i].setVisibility(false);
		}
		var l = this.getLayersBy("layer",layers);
		for (var i=0; i<l.length; i++) if (this.layers[i].CLASS_NAME.match(classname))
		{	if (l[i].isBaseLayer) this.setBaseLayer(l[i]);
			l[i].setVisibility(true);
		}
	},
	
	CLASS_NAME: "OpenLayers.Map.Geoportail"
}); 

/** Class: OpenLayers.Layer.Geoportail
*	Instances of OpenLayers.Layer.Geoportail are used to render Geoportail layers
*
* Inherits from:
*  - <OpenLayers.Layer.WMTS>
*/
OpenLayers.Layer.Geoportail = OpenLayers.Class(OpenLayers.Layer.WMTS, 
{	/** Autodetect HR/LR orthoimagery tiles
	*/
	AUTODETECT_LR: true,

	/** APIProperty: attributionIGN
	*	Attribution table
	*/
	attributionIGN:
	{	c_ign : " &copy; <a href='http://www.ign.fr/'>IGN-France</a> ",
		c_planet: " - <a href='http://www.planetobserver.com/'>Planet Observer</a> ",
		logoGeop : " <a class='attribution-ign' href='http://www.geoportail.fr/'><img src='http://api.ign.fr/geoportail/api/js/2.0.3/theme/geoportal/img/logo_gp.gif' /></a> "
	},
	
	/** APIProperty: capabilities
	*	Capabilities of the main services
	*/
	capabilities : 
	{	"BASELAYER":{minZoom:0, maxZoom:20, visibility:false, displayInLayerSwitcher:false, "title":"Baselayer","format":"image/jpeg","tilematrix":"PM","style":"normal","bbox":[-178.187,-84,178,84]},
		"ADMINISTRATIVEUNITS.BOUNDARIES":{"title":"Limites administratives","format":"image/png","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":18,"bbox":[-63.3725,-21.4756,55.9259,72.679],"desc":"Représentation des limites administratives (régions, départements, cantons, communes)","keys":"Unités administratives"},
		"AREAMANAGEMENT.ZFU":{"title":"Zones franches urbaines","format":"image/png","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":16,"bbox":[-63.3725,-21.4756,55.9259,51.3121],"desc":"Zones franches créées au sein de quartiers de plus de 8 500 habitants particulièrement défavorisés, en tenant compte des éléments de nature à faciliter l’implantation d’entreprises ou le développement d’activités économiques.","keys":"Zones de gestion"},
		"AREAMANAGEMENT.ZUS":{"title":"Zones urbaines sensibles","format":"image/png","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":16,"bbox":[-63.3725,-21.4756,55.9259,51.3121],"desc":"Zones urbaines caractérisées par la présence de grands ensembles ou de quartiers d’habitat dégradé et par un déséquilibre accentué entre l’habitat et l’emploi.","keys":"Zones de gestion"},
		"BUILDINGS.BUILDINGS":{"title":"Bâtiments","format":"image/png","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":18,"bbox":[-63.3725,-21.4756,55.9259,72.679],"desc":"Affichage des constructions couvrant le territoire français.","keys":"Bâtiments"},
		"CADASTRALPARCELS.PARCELS":{"title":"Parcelles cadastrales","format":"image/png","tilematrix":"PM","style":"bdparcellaire","minZoom":6,"maxZoom":20,"bbox":[-63.1607,-21.3922,55.8464,51.091],"desc":"Limites des parcelles cadastrales issues de plans scannés et de plans numériques.","keys":"Parcelles cadastrales"},
		"ELEVATION.LEVEL0":{"title":"Trait de côte Histolitt","format":"image/png","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":18,"bbox":[-63.2529,-21.51,55.9472,51.1388],"desc":"Formalisation de la limite entre le domaine terrestre et le domaine marin.","keys":"AltitudeLittoral"},
		"ELEVATION.SLOPES":{"title":"Carte du relief","format":"image/jpeg","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":14,"bbox":[-178.206,-22.5952,167.432,50.9308],"desc":"La couche altitude se compose d'un MNT (Modèle Numérique de Terrain) affiché en teintes hypsométriques et issu de la BD ALTI®.","keys":"Cartes"},
		"ELEVATION.SLOPES.HIGHRES":{"title":"Litto3D ®","format":"image/png","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":16,"bbox":[5.75296,42.9786,6.25761,43.2733],"desc":"Modèle numérique continu terre-mer sur la frange littorale.","keys":"Littoral"},
		"GEOGRAPHICALGRIDSYSTEMS.1900TYPEMAPS":{"title":"Carte topographique - environs de Paris (1906)","format":"image/jpeg","tilematrix":"PM","style":"normal","minZoom":10,"maxZoom":15,"bbox":[1.62941,48.4726,3,49.1548],"desc":"Carte topographique de Paris et de ses environs éditée en 1906.","keys":"Cartes historiques"},
		"GEOGRAPHICALGRIDSYSTEMS.ADMINISTRATIVEUNITS":{"title":"France administrative","format":"image/jpeg","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":10,"bbox":[-63.2459,-21.6371,56.052,51.5596],"desc":"Carte de la France administrative (régions, départements, arrondissements, cantons, communes)","keys":"Cartes"},
		"GEOGRAPHICALGRIDSYSTEMS.BONNE":{"title":"Guyane française (1780)","format":"image/jpeg","tilematrix":"PM","style":"normal","minZoom":0,"maxZoom":10,"bbox":[-55.9127,-0.49941,-50.0835,7.88966],"desc":"Carte de Guyane française établie par M. Bonne, Ingénieur-Hydrographe de la Marine. Cette carte figure dans l'\"atlas de toutes les parties connues du globe terrestre\", ouvrage rédigé par l'abbé Guillaume-Thomas RAYNAL et publié à Genève en 1780.","keys":"Cartes historiques"},
		"GEOGRAPHICALGRIDSYSTEMS.CASSINI":{"title":"Carte de Cassini (XVIIIe siècle)","format":"image/jpeg","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":15,"bbox":[-6.00063,42.019,9.2809,51.2455],"desc":"Carte de Cassini en couleur (feuilles gravées et aquarellées), issue de l’exemplaire dit de « Marie-Antoinette » du XVIIIe siècle.","keys":"Cartes historiques"},
		"GEOGRAPHICALGRIDSYSTEMS.COASTALMAPS":{"title":"Carte littorale (SHOM/IGN)","format":"image/png","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":16,"bbox":[-61.9629,-21.5348,56.1621,51.454],"desc":"Assemblage des cartes marines du Service hydrographique et océanographique de la marine (SHOM) et des cartes terrestres de l’IGN.","keys":"CartesLittoral"},
		"GEOGRAPHICALGRIDSYSTEMS.ETATMAJOR10":{"title":"Carte de l'état-major - environs de Paris (1818 - 1824)","format":"image/jpeg","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":16,"bbox":[1.82682,48.3847,2.79738,49.5142],"desc":"Carte des environs de Paris au 1 : 10 000 établie entre 1818 et 1824.","keys":"Cartes historiques"},
		"GEOGRAPHICALGRIDSYSTEMS.ETATMAJOR40":{"title":"Carte de l'état-major (1820-1866)","format":"image/jpeg","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":15,"bbox":[-6.08889,41.1844,10.961,51.2745],"desc":"Carte française en couleurs du XIXè siècle en couleurs superposable aux cartes et données modernes.","keys":"Cartes historiques"},
		"GEOGRAPHICALGRIDSYSTEMS.FRANCERASTER":{"title":"Carte France Raster ®","format":"image/jpeg","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":18,"bbox":[-63.7576,-21.5655,56.0405,51.0019],"desc":"Carte à grande échelle spécialement adaptée à l'affichage de données urbaines.","keys":"Cartes"},
		"GEOGRAPHICALGRIDSYSTEMS.MAPS":{"title":"Cartes IGN","format":"image/jpeg","tilematrix":"PM","style":"normal","minZoom":0,"maxZoom":18,"bbox":[-180,-67.7557,180,85.0511],"desc":"Cartes IGN","keys":"Cartes"},
		"GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.CLASSIQUE":{"title":"PYRAMIDE SCAN EXPRESS CLASSIQUE","format":"image/jpeg","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":18,"bbox":[-22.5,39.8841,22.5,55.7766],"desc":"Cartographie topographique multi-échelles du territoire français issue des bases de données vecteur de l’IGN –réalisée selon un processus cartographique innovant fortement automatisé.test","keys":"Cartes"},
		"GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.STANDARD":{"title":"PYRAMIDE SCAN EXPRESS STANDARD","format":"image/jpeg","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":18,"bbox":[-22.5,39.8841,22.5,55.7766],"desc":"Cartographie topographique multi-échelles du territoire français issue des bases de données vecteur de l’IGN –réalisée selon un processus cartographique innovant fortement automatisé.","keys":"Cartes"},
		"GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-OACI":{"title":"Carte OACI VFR","format":"image/jpeg","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":11,"bbox":[-5.99644,41.0322,11.1034,51.1831],"desc":"Les cartes OACI (Organisation de l'aviation civile internationale) ont été conçues pour le vol à vue (VFR : Visual Flights Rules). Elles proposent des informations aéronautiques fournies par le Service de l'information aéronautique (SIA) de la Direction générale de l'aviation civile (DGAC).","keys":"Transport"},
		"GEOGRAPHICALGRIDSYSTEMS.PLANIGN":{"title":"Plan IGN","format":"image/jpeg","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":18,"bbox":[-179.5,-75,179.5,75],"desc":"Représentation graphique des bases de données IGN.","keys":"Cartes"},
		"GEOGRAPHICALNAMES.NAMES":{"title":"Dénominations géographiques","format":"image/png","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":18,"bbox":[-63.3725,-21.4756,55.9259,72.679],"desc":"Affichage des noms des villes, villages, lieux-dits ...","keys":"Divers"},
		"HYDROGRAPHY.HYDROGRAPHY":{"title":"Hydrographie","format":"image/png","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":18,"bbox":[-63.3725,-21.4756,55.9259,72.679],"desc":"Affichage des lacs, réservoirs, rivières et cours d'eau en France.","keys":"Hydrographie"},
		"LANDCOVER.CORINELANDCOVER":{"title":"Corine Land Cover 2006","format":"image/png","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":13,"bbox":[-5.15047,41.3252,9.57054,51.0991],"desc":"Visualisation de l’occupation du sol en France métropolitaine. Outil de référence pour mesurer les impacts environnementaux.","keys":"Occupation des terres"},
		"LANDCOVER.FORESTAREAS":{"title":"Régions forestières nationales","format":"image/png","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":16,"bbox":[-5.15047,41.3252,9.57054,51.0991],"desc":"Cette cartographie représente des zones homogènes du point de vue des types de forêt ou de paysage sur la base de conditions physiques dominantes (climat, sol, relief).","keys":"Occupation des terres"},
		"LANDCOVER.FORESTINVENTORY.V1":{"title":"Carte forestière v1 (1987-2004)","format":"image/png","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":16,"bbox":[-5.34206,41.2065,9.82939,51.2203],"desc":"La cartographie forestière est une base de données cartographique des formations végétales forestières et naturelles. Elle couvre l'ensemble du territoire de France métropolitaine. Elle est réalisée par interprétation de photographies aériennes infrarouges et affinée par des contrôles sur le terrain (le seuil minimal de surface cartographiée est de 2,25 ha).","keys":"Occupation des terres"},
		"LANDCOVER.FORESTINVENTORY.V2":{"title":"Carte forestière (v2 : 2006-)","format":"image/png","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":16,"bbox":[-5.34206,41.2065,9.82939,51.2203],"desc":"Localisation de 32 types de formations végétales sur le territoire. Carte en cours de réalisation depuis 2006.","keys":"Occupation des terres"},
		"LANDCOVER.SYLVOECOREGIONS":{"title":"Sylvoécorégions","format":"image/png","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":16,"bbox":[-5.15047,41.3252,9.57054,51.0991],"desc":"Découpage de la France métropolitaine prenant en compte les facteurs biogéographiques déterminant la production forestière et la répartition des grands types d’habitat forestier.","keys":"Occupation des terres"},
		"LANDCOVER.SYLVOECOREGIONS.ALLUVIUM":{"title":"Sylvoécorégions d'alluvions récentes","format":"image/png","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":16,"bbox":[-5.15047,41.3252,9.57054,51.0991],"desc":"Affichage des cinq sylvoécorégions d’alluvions récentes correspondant aux cinq vallées des bassins des grands fleuves français et de leurs affluents, à enjeux importants.","keys":"Occupation des terres"},
		"LANDUSE.AGRICULTURE2007":{"title":"Registre parcellaire graphique (RPG) 2007","format":"image/png","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":16,"bbox":[-63.2635,-21.419,56.0237,51.2203],"desc":"Registre parcellaire graphique : zones de cultures déclarées par les exploitants en 2007.","keys":"Agriculture"},
		"LANDUSE.AGRICULTURE2008":{"title":"Registre parcellaire graphique (RPG) 2008","format":"image/png","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":16,"bbox":[-63.2635,-21.419,56.0237,51.2203],"desc":"Registre parcellaire graphique : zones de cultures déclarées par les exploitants en 2008.","keys":"Agriculture"},
		"LANDUSE.AGRICULTURE2009":{"title":"Registre parcellaire graphique (RPG) 2009","format":"image/png","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":16,"bbox":[-63.2635,-21.419,56.0237,51.2203],"desc":"Registre parcellaire graphique : zones de cultures déclarées par les exploitants en 2009.","keys":"Agriculture"},
		"LANDUSE.AGRICULTURE2010":{"title":"Registre parcellaire graphique (RPG) 2010","format":"image/png","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":16,"bbox":[-5.34206,41.2065,9.82939,51.2203],"desc":"Registre parcellaire graphique : zones de culture déclarées par les exploitants en 2010.","keys":"Agriculture"},
		"NATURALRISKZONES.1910FLOODEDWATERSHEDS":{"title":"Crues du bassin de la Seine - PHEC","format":"image/png","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":16,"bbox":[0.419457,47.4163,5.43248,50.064],"desc":"Carte des plus hautes eaux connues (PHEC) sur le bassin de la Seine : crue de la seine et de ses affluents en 1910, ainsi que d'autres crues à des dates postérieures sur d'autres cours d'eau.","keys":"Risques naturels"},
		"ORTHOIMAGERY.ORTHOPHOTOS":{"title":"Photographies aériennes","format":"image/jpeg","tilematrix":"PM","style":"normal","minZoom":0,"maxZoom":19,"bbox":[-178.187,-84,178,84],"desc":"Photographies aériennes","keys":"Photographies"},
		"ORTHOIMAGERY.ORTHOPHOTOS.COAST2000":{"title":"Ortholittorale 2000","format":"image/png","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":18,"bbox":[-5.21565,43.301,2.60783,51.1233],"desc":"Donnée issue du Référentiel géographique du littoral. Zone de couverture de l'orthophotographie : côte de la mer du Nord, de la Manche et de l'Atlantique.","keys":"Littoral"},
		"ORTHOIMAGERY.ORTHOPHOTOS.RAPIDEYE":{"title":"GEOSUD / RapidEye (2011)","format":"image/jpeg","tilematrix":"PM","style":"normal","minZoom":0,"maxZoom":15,"bbox":[-5.80725,41.0227,10.961,50.9218],"desc":"Image satellitaire de la France métropolitaine effectuée en 2011 par les satellites de télédétection RapidEye dans le cadre du projet EQUIPEX GEOSUD.","keys":"Images satellitaires"},
		"ORTHOIMAGERY.ORTHOPHOTOS.GENEVE":{"title":"Suisse - photographies aériennes du canton de Genève (SITG)","format":"image/png","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":20,"bbox":[5.95007,46.1241,6.31198,46.3658],"desc":"Photographie aérienne du canton de Genève.","keys":"Photographies"},
		"ORTHOIMAGERY.ORTHOPHOTOS.PARIS":{"title":"Paris haute résolution","format":"image/png","tilematrix":"PM","style":"normal","minZoom":12,"maxZoom":20,"bbox":[2.19509,48.8095,2.42968,48.9124],"desc":"Prises de vues aériennes de Paris à haute résolution.","keys":"Photographies"},
		"ORTHOIMAGERY.ORTHOPHOTOS2000-2005":{"title":"Photographies aériennes 2000-2005","format":"image/jpeg","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":18,"bbox":[-178.187,-21.4013,55.8561,51.091],"desc":"Prises de vues aériennes des territoires réalisées entre 2000 et 2005.","keys":"Photographies"},
		"PROTECTEDAREAS.CDL":{"title":"Conservatoire du littoral : Périmètres d'intervention","format":"image/png","tilematrix":"PM","style":"normal","minZoom":8,"maxZoom":16,"bbox":[-63.3725,-21.4756,55.9259,51.3121],"desc":"Les sites du conservatoire du littoral ont pour vocation la sauvegarde des espaces côtiers et lacustres. Leur accès au public est encouragé mais reste défini dans des limites compatibles avec la vulnérabilité de chaque site.","keys":"Littoral"},
		"PROTECTEDAREAS.CEN":{"title":"Conservatoire du littoral : Parcelles protégées","format":"image/png","tilematrix":"PM","style":"normal","minZoom":8,"maxZoom":16,"bbox":[-63.3725,-21.4756,55.9259,51.3121],"desc":"Les sites du conservatoire du littoral ont pour vocation la sauvegarde des espaces côtiers et lacustres. Leur accès au public est encouragé mais reste défini dans des limites compatibles avec la vulnérabilité de chaque site.","keys":"Littoral"},
		"PROTECTEDAREAS.ZNIEFF2":{"title":"Zones fonctionnelles de nature remarquable (ZNIEFF2)","format":"image/png","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":16,"bbox":[-63.3725,-21.4756,55.9259,51.3121],"desc":"Inventaire des espaces fonctionnels indispensables à la nature remarquable.","keys":"Ecologie"},
		"STATISTICALUNITS.IRIS":{"title":"Iris","format":"image/png","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":14,"bbox":[-63.3725,-21.4756,55.9259,51.3121],"desc":"Zones Iris définies par l'INSEE pour les besoins des recensements sur l'ensemble des communes de plus de 10 000 habitants et la plupart des communes de 5 000 à 10 000 habitants.","keys":"Divers"},
		"TRANSPORTNETWORKS.RAILWAYS":{"title":"Réseau ferroviaire","format":"image/png","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":18,"bbox":[-5.15047,41.3252,9.57054,51.0991],"desc":"Carte du réseau ferroviaire","keys":"Voies ferrées"},
		"TRANSPORTNETWORKS.ROADS":{"title":"Routes","format":"image/png","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":18,"bbox":[-63.3725,-21.4756,55.9259,72.679],"desc":"Affichage du réseau routier français et européen.","keys":"Réseau routier"},
		"TRANSPORTNETWORKS.RUNWAYS":{"title":"Aéroports","format":"image/png","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":18,"bbox":[-68.709,-21.4756,55.9259,76.5354],"desc":"Localisation des aéroports, aérodromes et héliports, des pistes, bâtiments et équipements dédiés.","keys":"Réseaux de transports"},
		"UTILITYANDGOVERNMENTALSERVICES.ALL":{"title":"Lignes électriques","format":"image/png","tilematrix":"PM","style":"normal","minZoom":6,"maxZoom":18,"bbox":[-63.3725,-21.4756,55.9259,51.3121],"desc":"Affichage des lignes électriques.","keys":"Energie"}
	},
	
	/** Constructor: OpenLayers.Layer.Geoportail
	*	Create a new Geoportail layer.
	*	Parameters:
	*	layer - {String} Layer name as defined by the service
	*	options - {Object} Configuration properties for the layer.
	*
	*	Any other documented layer properties can be provided in the config object.
	*
	*	Additional options :
	*	- gppKey : geoportal API key, if none is provided the map API key is used instead when used with an OpenLayers.Map.Geoportail
	*	- minZoom - maxZoom : zoom range for layer visibility (use client zoom if different from server resolution)
	*	- minZoomLevel - maxZoomLevel : zoom range for server resolution restriction
	*
	*/
	initialize: function (layer, options)
	{	if (!options) options={};

		var opt = 
		{	url: "http://wxs.ign.fr/" + options.key + "/wmts",
			layer: layer,
			matrixSet: "PM",
			style: this.capabilities[layer] ? this.capabilities[layer].style : "normal",
			name: this.capabilities[layer] ? this.capabilities[layer].title : "Carte",
			format: this.capabilities[layer] ? this.capabilities[layer].format : "image/png",
			minZoom : this.capabilities[layer] ? this.capabilities[layer].minZoom : 0,
			maxZoom : this.capabilities[layer] ? this.capabilities[layer].maxZoom : 18,
			visibility : this.capabilities[layer] && this.capabilities[layer].visibility ? this.capabilities[layer].visibility : false,
			displayInLayerSwitcher : this.capabilities[layer] ? this.capabilities[layer].displayInLayerSwitcher : true,
			attribution: this.attributionIGN.c_ign+this.attributionIGN.logoGeop,
			tileFullExtent: (this.capabilities[layer] && this.capabilities[layer].bbox) ? new OpenLayers.Bounds (this.capabilities[layer].bbox) : null,
			exceptions: "text/xml"
		};

		var geopresolutions = [156543.03390625,78271.516953125,39135.7584765625,19567.87923828125,9783.939619140625,4891.9698095703125,2445.9849047851562,1222.9924523925781,611.4962261962891,305.74811309814453,152.87405654907226,76.43702827453613,38.218514137268066,19.109257068634033,9.554628534317017,4.777314267158508,2.388657133579254,1.194328566789627,0.5971642833948135,0.29858214169740677,0.14929107084870338];
		
		// Serveur resolutions 
		options.serverResolutions = [];
		for (var i= (options.minZoomLevel || opt.minZoom); i<= (options.maxZoomLevel || opt.maxZoom); i++) options.serverResolutions.push(geopresolutions[i]);
		options.zoomOffset = opt.minZoom;

		options = OpenLayers.Util.extend(OpenLayers.Util.extend({}, opt), options);

		// Layer resolution
		options.resolutions = [];
		for (var i=options.minZoom; i<=options.maxZoom; i++) options.resolutions.push(geopresolutions[i]);
		options.transitionEffect = 'resize';

		// Load error (detect tile load error)
		options.tileOptions = 
		{	eventListeners: 
			{	'loaderror': function(evt) 
				{	this.imgDiv.src = OpenLayers.Util.getImageLocation("blank.gif");
					this.layer.isLoadError = true;
					// console.log ("loaderror");
				}
			}
		};
		//
		// OpenLayers.Util.onImageLoadErrorColor = "transparent";
		OpenLayers.Layer.WMTS.prototype.initialize.apply(this, [options]);

		/* Autodetect HR/LR orthoimagery tiles and switch to resample mode for LR tiles (when load error occurs)
			HR tiles have serverResolutions up to level 20
			LR tiles have serverResolutions up to level 19
		*/
		if (this.AUTODETECT_LR && layer == "ORTHOIMAGERY.ORTHOPHOTOS" && this.serverResolutions[19] == geopresolutions[19])
		{	this.events.register("moveend", this, function(e)
				{	// Switch to standard mode (HR)
					if (e.zoomChanged && this.map.zoom < 19 && this.serverResolutions.length != 20)
					{      this.serverResolutions.push (geopresolutions[19]);
					}
				});
			this.events.register("loadend", this, function(e)
				{	// Switch to resample mode (LR)
					if (this.isLoadError && this.map.zoom > 18 && this.serverResolutions.length==20)
					{	this.serverResolutions.pop();
						this.redraw();
					}
					this.isLoadError = false;
				});
		}

	},

    /** 
     * Method: setMap
     *
     * Properties:
     * map - {<OpenLayers.Map>} 
     */
    setMap: function(map) 
	{   OpenLayers.Layer.WMTS.prototype.setMap.apply(this, arguments);
		// Set the Geoportal Key if no one is provided
		if (!this.gppKey) 
		{	this.gppKey = map.gppKey;
			this.url = "http://wxs.ign.fr/" + this.gppKey + "/wmts";
		}
        // Change tileExtent projection
		if (this.tileFullExtent) 
		{	var proj = map.getProjectionObject();
			if (!proj) proj = new OpenLayers.Projection(map.projection);
			this.tileFullExtent.transform(new OpenLayers.Projection('EPSG:4326'), proj);
		}
	},
	
	/**
     * Method: getServerZoom
     * Return the zoom value corresponding to the best matching server
     * resolution, taking into account <serverResolutions> and <zoomOffset> and <baseLayer.minZoom>.
     *
     * Returns:
     * {Number} The closest server supported zoom. This is not the map zoom
     *     level, but an index of the server's resolutions array.
     */
	getServerZoom: function() 
	{   var resolution = this.getServerResolution();
		var zoomOffset = (!this.isBaseLayer && this.map.baseLayer) ? this.map.baseLayer.minZoom : this.zoomOffset;
        return this.map.getZoomForResolution(resolution) + (zoomOffset || 0);
		/*
        return this.serverResolutions ?
            OpenLayers.Util.indexOf(this.serverResolutions, resolution) :
            this.map.getZoomForResolution(resolution) + (zoomOffset || 0);
		*/
    },

    CLASS_NAME: "OpenLayers.Layer.Geoportail"
	
});
