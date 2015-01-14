/** Barre de recherche par adresse
	@param div : la div dans laquelle mettre l'input
	@param map : la carte (avec une cle API)
	@param options :
	{	name			: <String> nom pour l'input
		autocomplete	: <bool> gerer l'autocompletion
		mincar			: <int> nombre min de caractere pour l'autocompletion
		poi				: <bool> recherche sur les POI
		adresse			: <bool> recherche sur les adresses
		toggle			: <bool> bouton pour basculer en mode adresse / poi
		filtre			: <String> commune : Limiter la recherche aux communes
	}


*/
function SearchBar (div, map, options)
{	div = $(div);
	var self = this;
	if (!options) options = {};
	// Service 
	var service = new GeoportailService(map.gppKey);
	// var keyboardDefault = map.getMap().getControlsByClass('OpenLayers.Control.KeyboardDefaults').pop();
	// var handlekeyboardDefault = keyboardDefault.handler.callbacks['keydown'];
	// Choix dans le menu
	var choix = -1;

	// Recherche du choix dans la liste
	function selectChoix(c)
	{	var i=0;
		$("a",acdiv).each(function()
		{	if (i==c) $(this).addClass('select');
			else $(this).removeClass('select');
			i++;
		});
		if (c<0) choix=-1;
		if (c>=i) choix=i;
	}
	function getChoix()
	{	var i=0;
		var c=null;
		$("a",acdiv).each(function()
		{	if (i==choix) 
			{	input.val($(this).text());
				c = $(this);
				return false;
			}
			i++;
		});
		return c;
	}

	// Autocompletion
	function onAutocomplete ()
	{	if (options.autocomplete===false) return;
		var t = input.val();
		if (t.length > (options.mincar || 3))
		{	service.autocomplete(t, function(r) 
			{	if (r && r.length)
				{	var auto = acdiv.html("");
					if (input.is(":focus")) acdiv.show();
					else acdiv.hide();
					for (var i=0; i<r.length; i++)
					{	choix = -1;
						if (!options.filtre || (options.filtre=="commune" && r[i].classification<6) )
						{	$("<a>")
								.on("touchstart click",function()
								{	// Adresse ou POI
									if ($(this).data("type")=="PositionOfInterest" && $(this).data("text")) input.val($(this).data("text"));
									else input.val($(this).text());
									// Si pas de fonction => se centrer sur la position
									var ll = $(this).data("lonlat");
									if (!options.callback && (ll.lon && ll.lat))
									{	map.setCenterAtLonlat([ll.lon, ll.lat ]);
									}
									else search( { q: input.val(), lonlat: $(this).data("lonlat"), city: $(this).data("city") } );
								})
								.text(r[i].fulltext)
								.data("type", r[i].country)
								.data("text", r[i].street)
								.data("city", r[i].city)
								.data("lonlat", { lon:r[i].x, lat:r[i].y } )
								.appendTo(auto);
						}
					}
				}
				else acdiv.hide();
			},
			{	poi: options.poi,
				adresse: (options.adresse===false?false:true)
			});
		}
		else acdiv.hide();
	}

	// Lancer la recherche
	function search(q)
	{	acdiv.hide();
		input.blur();
		service.geocode((q && q.q) ? q.q : input.val(), function(r) 
		{	var a, html = "";
			if (r && r.length)
			{	if (typeof(options.callback)=='function') options.callback(r, q);
				else 
				{	if (q)
					{	for (var i=0; i<r.length; i++)
						{	if (r[i].place.commune == q.city) 
							{	map.setCenterAtLonlat([ r[i].lon, r[i].lat ]);
								return;
							}
						}
					}
					map.setCenterAtLonlat([ r[0].lon, r[0].lat ]);
				}
			}
			else t = "<i>Pas de réponse...</i>";
			$("#resp").html(html);
			$("#autoc").hide();
		}, 
		{	max:20,
			poi: options.poi,
			adresse: (options.adresse===false?false:true)
		});
	}

	// Fond pour eviter l'interaction avec la carte (keyboard)
	var bground = $("<div>")
					.css({ display:"none", position:"fixed", top:0, left:0,right:0,bottom:0, "z-index":-1 })
					.appendTo(div);
	// Input pour la saisie
	var input = $('<input type="text">')
					.attr('placeholder',options.placeholder?options.placeholder:'adresse | ville | code postal')
					.attr("name",options.name)
					.keyup(function(e) 
					{	switch (e.keyCode)
						{	case 13: // RETURN
								var c = getChoix();
								if (c) c.click();
								else search();
								break;
							case 27: // ESC
								acdiv.hide();
								break;
							case 40: // DOWN
								selectChoix(++choix);
								break;
							case 38: // UP
								selectChoix(--choix);
								break;
							default: onAutocomplete();
						}
					})
					.focus(function(e)
					{	bground.show();
						//keyboardDefault.handler.callbacks['keydown'] = function(){};
					})
					.blur(function(e)
					{	setTimeout(function(){acdiv.hide()},200);
						bground.hide();
						//keyboardDefault.handler.callbacks['keydown'] = handlekeyboardDefault;
					})
					.appendTo(div);
	input.wrap('<div class="inputWrapper" style="display:inline">');

	bground.on("touchstart", function(){ input.blur(); });
	
	// Bouton adresse / lieu-dit
	if (options.toggle)
	{	options.adresse = !options.poi;
		var addrchk = $('<div>')
						.click(function()
						{	options.poi = !options.poi;
							options.adresse = !options.poi;
							if (options.poi) 
							{	$(this).addClass('poichk')
									.removeClass('addrchk')
									.attr("title","Recherche Lieux-dits");
							}
							else
							{	$(this).addClass('addrchk')
									.removeClass('poichk')
									.attr("title","Recherche Adresses");
							}
							input.focus();
							setTimeout(function(){ onAutocomplete() },100);
						})
						.addClass (options.poi ? 'poichk':'addrchk')
						.appendTo(div);
	}
	$("<br/>").appendTo(div);
	// Liste de choix pour l'autocompletion
	var acdiv = $('<div class="autocomplete">')
					.css({ display:"none", background:"#fff" })
					.appendTo(div);

	/* Fonctions publiques */
	this.search = function (t)
	{	input.val(t);
		search();
	}
}