Tactileo-quest
==============

Tactileo Quest is a proof of concept to demonstrate the abilities of collecting information on a map to use in a serious game.
Tactileo is a french project of the Education Nationale that aims to study and define API for touch devices to bring such devices into school context.
IGN-France is involved in this project in defining interactions with maps.

*Disclaimer: This sample app is by no means a complete game or complete game engine. I wrote this code in about 4 days (including design and sprite) and additional cleanup/optimization should be used in a real-world game.*

**Source code**

Full source code for this demo application is available on GitHub under the CeCILL-B licence (a french BSD like licence, http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt). 
This code is provided as-is. 

**Development Approach**

This demo game is implemented entirely in HTML5/CSS3 and JavaScript to ensure compatibility with all devices involved in the project. 
It is an isometric RPG like game where 
Game play mecanisms will be implemented afterwards to guide the student in a quest to solve a problem or to acquire informations in a school environment. The map used in this context is an old map layer (1820-1866) provided by the [french Geoportail](http://www.geoportail.gouv.fr/donnee/56/carte-de-l-etat-major-en-couleur?l=GEOGRAPHICALGRIDSYSTEMS.ETATMAJOR40$GEOPORTAIL:OGC:WMTS%281%29&permalink=yes). I use the OpenLayers library to render it.
For interaction with contents, the resources are provided by the french [DBPedia project](http://fr.dbpedia.org/).

I inspired myself of the PhoneGap-Legends game published by Andrew Trice (https://github.com/triceam/PhoneGap-Legends).

