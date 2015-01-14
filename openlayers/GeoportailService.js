/*
	Copyright (c) 2013 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
	
	GeoportailService : IGN's Geoportail srvices definition
	
	# Geocode OpenLS services :
	 - geocode : Adress / geographical names search 
	 - reverseGeocode : reverse search
	 - autocomplete : autocompletion
	
	# Altimetric services :
	 - altimetry : altimetric search on IGN's BDAlti(r) 75m DTM
	
	doc : http://api.ign.fr/tech-docs-js/fr/developpeur/search.html
	http://depot.ign.fr/geoportail/api/develop/tech-docs-js/fr/developpeur/search.html
	http://depot.ign.fr/geoportail/api/develop/tech-docs-js/fr/developpeur/alti.html
	
	Dependencies : jQuery
*/
var GeoportailService = function (apiKey, proxy)
{	var _type = "GET";
	var _dataType = "jsonp";

	this.setMode = function(mode)
	{	switch(mode)
		{	case "POST":
				_type = "POST";
				_dataType = "text";
				break;
			case "GET":
				_type = "GET";
				_dataType = null;
				break;
			default: 
				_type = "GET";
				_dataType = "jsonp";
				break;
		}
	}

	// Decodage d'une adresse
	this.decodeAdresse = function(a)
	{	var r =
		{	place:
			{	municipality: a.find("Place[type=Municipality]").text(),
				qualite: a.find("Place[type=Qualite]").text(),
				commune: a.find("Place[type=Commune]").text(),
				departement: a.find("Place[type=Departement]").text(),
				insee: a.find("Place[type=INSEE]").text(),
				nature: a.find("Place[type=Nature]").text(),
				territoire: a.find("Place[type=Territoire]").text()
			},
			bbox: a.find("Place[type=Bbox]").text().split(';')
		}
		var t = a.find("GeocodeMatchCode");
		if (t.length)
		{	r.match=
			{	type: t.attr('matchType'),
				accuracy: t.attr('accuracy')
			};
		}
		t = a.find("ExtendedGeocodeMatchCode");
		if (t.length)
		{	r.match =
			{	type: t.text(),
				distance: Number(a.find("SearchCentreDistance").attr("value"))
			};
		}
		var sa = a.find("StreetAddress");
		r.adresse =
		{	num: sa.find("Building").attr("number"),
			rue: sa.find("Street").text(),
			cpost: a.find ("PostalCode").text()
		};
		var p = $(a).find("pos").text().split(' ');
		r.lon = Number(p[1]);
		r.lat = Number(p[0]);
		return r;
	};
	
	// Encapsulation dans une requete XLS
	this.xlsRequest = function(query)
	{	return '<?xml version="1.0" encoding="UTF-8"?>'
			+'<XLS version="1.2"'
			+'    xmlns:xls="http://www.opengis.net/xls"'
			+'    xmlns:gml="http://www.opengis.net/gml"'
			+'    xmlns="http://www.opengis.net/xls"'
			+'    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'
			+'    xsi:schemaLocation="http://www.opengis.net/xls http://schemas.opengis.net/ols/1.2/olsAll.xsd">'
			+'  <RequestHeader/>'
			+ query 
			+'</XLS>';
			
	};

	/** Recherche par adresse
		@param (String) : adresse
		@param callback (function) : fontion de retour
		@param options
			{	bbox (object) : {lonmin, latmin, lonmax, latmax }
				adresse (bool) : recherche par adresse
				poi (bool) : recherche parmis les poi
			}
		@return dans callback (false si pas de reponse)
		[	{	lon, lat:
				adresse:
				{	num: 
					rue:
					cpost:
				}
				bbox:
				[ lonmin, latmin, lonmax, latmax ]
				match:
				{	occuracy: 
					type:
				}
				place:
				{	commune:
					departement:
					insee:
					municipality:
					qualite:
					nature:
					territoire:
				}
			}
		]
	*/
	this.geocode = function (queryString, callback, options)
	{	if (!options) options={};
		var self = this;
		var mode = "StreetAddress";
		if (options.poi)
		{	if (options.adresse) mode = 'PositionOfInterest,StreetAddress';
			else mode = 'PositionOfInterest';
		}
		/*
		<?xml version="1.0" encoding="UTF-8"?><xls:XLS xmlns:xls="http://www.opengis.net/xls" version="1.2"><xls:RequestHeader sessionID=""/><xls:Request methodName="GeocodeRequest" version="1.2" requestID=""><xls:GeocodeRequest><xls:Address countryCode="StreetAddress"><xls:freeFormAddress>152 rue claude nicolas ledoux, 30900 NÎMES</xls:freeFormAddress></xls:Address></xls:GeocodeRequest></xls:Request></xls:XLS>
		*/
		// LocationUtilityService
		var xls = '  <Request requestID="1" version="1.2" methodName="GeocodeRequest" maximumResponses="'+(options.max?options.max:10)+'">'
			+'   <GeocodeRequest returnFreeForm="false">'
			+'     <Address countryCode="'+mode+'">' 
			+'OPTIONS'
			+'ADRESSE'
			+'     </Address>'
			+'   </GeocodeRequest>'
			+' </Request>';

		// DEPARTEMENT
		opt = "";
		if (options.departement) opt += '<Place type="Departement">'+options.departement+'</Place>';
		// if (options.commune) opt += '<Place type="Municipality">'+options.commune+'</Place>';
		if (options.insee) opt += '<Place type="insee">'+options.insee+'</Place>';
		if (options.nature) opt += '<Place type="Nature">'+options.nature+'</Place>';
		// BBOX
		if (opt.bbox)
		{	opt += '<gml:envelope>'
				+' <gml:pos>'+opt.bbox.latmin+' '+opt.bbox.lonmin+'</gml:pos>'
				+' <gml:pos>'+opt.bbox.latmax+' '+opt.bbox.lonmax+'</gml:pos>'
				+'</gml:envelope>';
		}
		xls = xls.replace ('OPTIONS',opt);
		// REQUETE
		xls = xls.replace ('ADRESSE','<freeFormAddress>'+queryString+'</freeFormAddress>');
		xls = this.xlsRequest(xls);

		// Envoyer la requete
		var d = new Date();
		$.ajax({
			url: "http://wxs.ign.fr/"+apiKey+"/geoportail/ols",
			dataType: _dataType,
			type: _type,
			contentType : "application/xml; charset=UTF-8",
			data: (_type=="GET" ? { output: 'json', xls: xls } : xls),
			timeout: options.timeout?options.timeout:20000,
			success: function( resp )
			{	var r, result = [] ;
				// console.log (queryString +" ("+options.departement+")"+" - "+mode+" = "+(Math.round((new Date()-d)/10)/100)+"s");
				if (_dataType!="text") resp = resp.xml;
				if (resp)
				{	var xml = $.parseXML(resp.replace(/gml:/g,""));
					var add = $(xml).find("GeocodedAddress");
					for (var i=0; i<add.length; i++)
					{	r = self.decodeAdresse($(add[i]));
						result.push(r);
					}
					//console.log(result);		
					if (callback) callback( result );
				}
				else
				{	callback (false, resp.statut, resp.error);
				}
			},
			error: function(resp, status, error)
			{	callback (false, status, error);
			}
		});
	} ;
	
	/** Service de geocodage inverse
		@param (Number) : lon
		@param (Number) : lat,
		@param callback (function) : fontion de retour
		@param options
			{	dist (Number) : rayon de recherche
				adresse (bool) : recherche par adresse
				poi (bool) : recherche parmi les noms de lieux,
				max : nombre maximum de reponse
			}
		@return dans callback (false si pas de reponse)
		[	{	lon, lat:
				adresse:
				{	num: 
					rue:
				}
				bbox:
				[ lonmin, latmin, lonmax, latmax ]
				match:
				{	distance: 
					type:
				}
				place:
				{	commune:
					departement:
					insee:
					municipality:
					qualite:
					territoire:
				}
			}
		]
	*/
	this.reverseGeocode = function( lon, lat, callback, options )
	{	if (!options) options={};
		var self = this;
		var xls = '<Request'
				+'    methodName="ReverseGeocodeRequest"'
				+'    maximumResponses="'+(options.max?options.max:'10')+'"'
				+'    requestID="abc"'
				+'    version="1.2">'
				+'   <ReverseGeocodeRequest>'
				+'ADRESSE'
				+'    <Position>'
				+'     <gml:Point><gml:pos>'+lat+' '+lon+'</gml:pos></gml:Point>'
				+'RAYON'
				+'    </Position>'
				+'   </ReverseGeocodeRequest>'
				+'</Request>';
		// Type de recherche (adresse ou poi)
		var a=''
		if (options.adresse) a += '<ReverseGeocodePreference>StreetAddress</ReverseGeocodePreference>';
		if (options.poi) a += '<ReverseGeocodePreference>StreetAddress</ReverseGeocodePreference>';
		if (!a) a = '<ReverseGeocodePreference>StreetAddress</ReverseGeocodePreference>';
		xls = xls.replace('ADRESSE',a);
		// Recherche dans un rayon
		a = '';
		if (options.dist)
		{	a =	'<gml:CircleByCenterPoint>'
				+'  <gml:pos>'+lat+' '+lon+'</gml:pos>'
				+'  <gml:radius>'+options.dist+'</gml:radius>'
				+'</gml:CircleByCenterPoint>';
		}
		xls = xls.replace ('RAYON',a);
		// TODO : recherche dans un polygone
		
		xls = this.xlsRequest(xls);
			
		$.ajax({
			url: "http://wxs.ign.fr/"+apiKey+"/geoportail/ols",
			dataType: _dataType,
			type: _type,
			contentType : "application/xml; charset=UTF-8",
			data: (_type=="GET" ? { output: 'json', xls: xls } : xls),
			timeout: options.timeout?options.timeout:10000,
			success: function( resp )
			{	if (_dataType!="text") resp = resp.xml;
				if (resp)
				{	var result = [] ;
					
					var xml = $.parseXML(resp.replace(/gml:/g,"").replace(/xlsext:/g,""));
					var loc = $(xml).find("ReverseGeocodedLocation");
					for (var i=0; i<loc.length; i++)
					{	var r = self.decodeAdresse($(loc[i]));
						result.push(r);
					}
					//console.log(result);
					if (callback) callback (result);
				}
				else
				{	callback (false, resp.statut, resp.error);
				}
			},
			error: function(resp, status, error)
			{	callback (false, status, error);
			}
		});
	} ;
	
	/** Service d'autocompletion
		@param txt (String) : le texte a completer
		@param callback (function) : fontion de retour
		@param options
			{	terr : 
					-'METROPOLE' pour une recherche sur la métropole et la corse ;
					-'DOMTOM' pour une recherche sur les DOM­ TOMs uniquement ;
					-une liste de codes de départements ou codes INSEE de communes pour une recherche limitée à ces département ou commues spécifiés ;
				adresse (bool) : recherche par adresse
				poi (bool) : recherche parmi les noms de lieux,
				max : nombre maximum de reponse
			}
		@return dans callback
		{	country : type du localisant : 'StreetAddress' ou 'PositionOfInterest' ;
			fulltext : proposition complete ;
			street : rue ou toponyme ;
			city : ville ;
			zipcode : code postal ;
			classification : classification ;
			kind : type ;
			x,y : longitude, latitude.
		}
	*/
	this.autocomplete = function (txt, callback, options)
	{	if (!options) options = {};
		var type = '';
		if (options.adresse) type = 'StreetAddress';
		if (options.poi) type = (type?type+',':'')+'PositionOfInterest';
		$.ajax(
		{	url : "http://wxs.ign.fr/"+apiKey+"/ols/apis/completion",
			dataType : "jsonp",
			data : 
			{	text : txt,
            	terr: (options.territoire?options.territoire:null),	// 'METROPOLE' / 'DOMTOM' / 75;77;78;91;92;93;94;95
            	type: (type?type:'StreetAddress'), // StreetAddress,PositionOfInterest
            	maximumResponses: (options.max?options.max:'10')
            },
			success: function (resp)
			{	//console.log (resp.results);
				if (callback) callback(resp.results);
			}
		});
	};
	
	/** Service altimetrique
		@param lon (Array|String|Number) : lon du point ou tableau de longitude
		@param lat (Array|String|Number) : lat du point ou tableau de latitude
		@param callback (function) : fontion de retour
		@param s : nombre de chiffre significatif (pour limiter la taille de l'url)
		@return dans callback (Array) : tableau de point
		[	{	lon, lat : position
				z : altitude
				acc : precision
			}
		}		
	*/
	this.altimetry = function(lon,lat, callback, s)
	{	if (!s) s = 4;
		if (lon instanceof Array) 
		{	// Limiter la taille des urls si trop de points)
			if (lon.length>10)
			{	var r = Math.pow(10,s);
				for (var i=0; i<lon.length; i++) lon[i] = Math.round(lon[i]*r)/r;
				for (var i=0; i<lat.length; i++) lat[i] = Math.round(lat[i]*r)/r;
			}
			lontxt = lon.join('|');
			lattxt = lat.join('|');
		}
		else
		{	lontxt = lon;
			lattxt = lat;
			lon = [lon];
			lat = [lat];
		}
		$.ajax(
			{	url : "http://wxs.ign.fr/"+apiKey+"/alti/rest/elevation.xml",
				dataType : "jsonp",
				data : 
				{	lon: lontxt,
					lat: lattxt,
					output: "json"
				},
				timeout: options.timeout?options.timeout:10000,
				success: function (resp)
				{	console.log (resp);
					if (resp)
					{	var xml = $.parseXML(resp.xml);
						var e = $(xml).find("elevation");
						var result=[];
						for (var i=0; i<e.length; i++)
						{	var r = 
							{	lon: lon[i], // Number($(e[i]).find("lon").text()),
								lat: lat[i], // Number($(e[i]).find("lat").text()), 
								z: Number($(e[i]).find("z").text()), 
								acc: Number($(e[i]).find("acc").text())
							};
							result.push(r);
						}
						console.log(result);
					}
					if (callback) callback(result);
				},
				error: function(resp, status, error)
				{	callback (false, status, error);
				}
			});
	};
	
	/** Service altimetrique (necessite un proxy)
		@param lon (Array|String|Number) : lon du point ou tableau de longitude
		@param lat (Array|String|Number) : lat du point ou tableau de latitude
		@param nb (Number) : Nombre de point de l'echantillon
		@param callback (function) : fontion de retour
		@param s : nombre de chiffre significatif (pour limiter la taille de l'url)
		@return dans callback (Array) : tableau de point
		[	{	lon, lat : position
				z : altitude
				acc : precision
			}
		}		
	*/
	this.altimetryLine = function(lon,lat,nb, callback, s)
	{	if (!s) s = 4;
		if (lon instanceof Array) 
		{	// Limiter la taille des urls si trop de points)
			if (lon.length>10)
			{	var r = Math.pow(10,s);
				for (var i=0; i<lon.length; i++) lon[i] = Math.round(lon[i]*r)/r;
				for (var i=0; i<lat.length; i++) lat[i] = Math.round(lat[i]*r)/r;
			}
			lontxt = lon.join('|');
			lattxt = lat.join('|');
		}
		else
		{	lontxt = lon;
			lattxt = lat;
			lon = [lon];
			lat = [lat];
		}
		$.ajax(
			{	url : "http://wxs.ign.fr/"+apiKey+"/alti/rest/elevationLine.xml",
				dataType : "jsonp",
				data : 
				{	lon: lontxt,
					lat: lattxt,
					sampling:(nb?nb:20),
					output: "json"
				},
				timeout: options.timeout?options.timeout:10000,
				success: function (resp)
				{	console.log (resp);
					if (resp)
					{	var xml = $.parseXML(resp.xml);
						var e = $(xml).find("elevation");
						var result=[];
						for (var i=0; i<e.length; i++)
						{	var r = 
							{	lon: Number($(e[i]).find("lon").text()),
								lat: Number($(e[i]).find("lat").text()), 
								z: Number($(e[i]).find("z").text()), 
								acc: Number($(e[i]).find("acc").text())
							};
							result.push(r);
						}
						console.log(result.length);
						console.log(result);
					}
					if (callback) callback(result);
				},
				error: function(resp, status, error)
				{	callback (false, status, error);
				}
			});
	};

	// Calcul JSON via proxy (bug en JSONP)
	this.altimetry0 = function(lon,lat, callback)
	{	if (!proxy) { condole.log ("[ALTIMETRY] Error : no proxy found"); return; }
		if (lon instanceof Array) 
		{	lon = lon.join('|');
			lat = lat.join('|');
		}
		$.ajax(
			{	url: proxy,
				data : 
				{	url : "http://wxs.ign.fr/"+apiKey+"/alti/rest/elevation.json",
					lon: lon,
					lat: lat,
					indent: false
				},
				timeout: options.timeout?options.timeout:10000,
				success: function (resp)
				{	//console.log (resp);
					if (resp)
					{	resp = eval ("resp="+resp);
						resp = resp.elevations;
					}
					if (callback) callback(resp);
				},
				error: function(resp, status, error)
				{	callback (false, status, error);
				}
			});
	};
};

