#Tactileo-quest

Tactileo Quest is a proof of concept to demonstrate the abilities of collecting information on a map to use in a serious game.
[**Tactileo**](http://projet.tactileo.net/) is a french project of the Education Nationale that aims to study and define API for multi touch devices to bring such devices into school context.
IGN-France is involved in this project in defining interactions with maps.

*Disclaimer: This sample app is by no means a complete game or complete game engine. I wrote this code in about 4 days (including design and sprite) and additional cleanup/optimization should be used in a real-world game.*

![Tactileo-Quest](http://www.ign.fr/institut/sites/all/files/tactileo-quest.jpg)

If you’d like to test this out on your own devices, you can now access it online at http://ignf.github.io/tactileo-quest/
On Android you should better use Chrome and "Add to homescreen" to run the webapp fullscreen.
On Iphone/IPad, tap the share button. On windows, don't use IExplorer on touch screen!

###Source code

Full source code for this demo application is available on GitHub under the [CeCILL-B licence](http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt) (a french BSD like licence). 
This code is provided as-is. 

###Development Approach

This demo game is implemented entirely in HTML5/CSS3 and JavaScript to ensure compatibility with all devices involved in the project. 
We may use PhoneGap or a Qt webview to encapsulate it in an app.
It is an isometric RPG like game where the goal is to collect information on a map.
I use the sprite sheets developped by the [Liberated Pixel Cup team](https://github.com/jrconway3/Universal-LPC-spritesheet/blob/master/AUTHORS.txt) and the [Guarav0's charater generator](https://github.com/Gaurav0/Universal-LPC-Spritesheet-Character-Generator/commits/master) to create the sprites.

Game play mecanisms would be implemented afterwards to guide the student in a quest to solve a problem or to acquire informations in a school environment.
The map used in this context is an old map layer (1820-1866) provided by the [french Geoportail](http://www.geoportail.gouv.fr/donnee/56/carte-de-l-etat-major-en-couleur?l=GEOGRAPHICALGRIDSYSTEMS.ETATMAJOR40$GEOPORTAIL:OGC:WMTS%281%29&permalink=yes).
I use the OpenLayers library to render it.
For interaction with contents, the resources are provided by the french [DBPedia project](http://fr.dbpedia.org/).

This project was also freely inspired by the PhoneGap-Legends game published by Andrew Trice (https://github.com/triceam/PhoneGap-Legends).

### ATTRIBUTION

The following assets were used in the creation of this sample app:

- Images and animations
	- Logo Tactileo - (c) Tacileo 2014 - http://projet.tactileo.net/
	- Universal LPC Sprite Sheet - (c) CC-By-SA - https://github.com/jrconway3/Universal-LPC-spritesheet/blob/master/AUTHORS.txt
	- A whole lot of RPG items by Orteil - (c) CC-By-SA - http://orteil.deviantart.com/art/A-whole-lot-of-RPG-items-379986564
	- Parchemin by stux, modified - (c) CC0 Public Domain - http://pixabay.com/fr/certificat-papier-parchemin-port%C3%A9-70844/
	- Papyrus by geralt, modified - (c) CC0 Public Domain - http://pixabay.com/fr/parchemin-papyrus-sale-vieux-435347/
	- Compass Rose by ElfQrin - (c) CC-By-SA - http://fr.wikipedia.org/wiki/Fichier:Compass_rose_en_04p.svg

- Font
	- Almendra font (c) 2011-2012 Ana Sanfelippo, Open font Licence v1.1 - http://www.fontsquirrel.com/fonts/almendra

- Cartography
	- [Carte d'Etat Major(r) (1820-1866)](http://www.geoportail.gouv.fr/donnee/56/carte-de-l-etat-major-en-couleur?l=GEOGRAPHICALGRIDSYSTEMS.ETATMAJOR40$GEOPORTAIL:OGC:WMTS%281%29&permalink=yes) - (c) IGN-Géoportail
	- [Photographies aériennes](http://www.geoportail.gouv.fr/donnee/81/photographies-aeriennes?l=ORTHOIMAGERY.ORTHOPHOTOS$GEOPORTAIL:OGC:WMTS%281%29&permalink=yes) - (c) IGN-Géoportail

- Information resource
	- DBPedia Knowledge Base - (c) DBPedia CC-By-SA - http://dbpedia.org/About

- Libraries
	- jQuery - MIT License - http://jquery.com/
	- jQuery custom scroller (c) Malihu - MIT License - http://manos.malihu.gr/jquery-custom-content-scroller/
	- Add to Homescreen (c) 2014 Matteo Spinelli - MIT License - http://cubiq.org/add-to-home-screen
