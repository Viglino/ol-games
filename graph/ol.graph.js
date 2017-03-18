/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
	
	@example http://www.hexographer.com/
	
*/
/**
* Abstract base class; normally only used for creating subclasses and not instantiated in apps. 
* Base class for graphs.
*
* @constructor ol.Graph
* @extends {ol.Object}
* @param {olx.Graph=} options
* @todo 
*/
ol.Graph = function(options)
{	options = options || {};
	
	ol.Object.call (this, options);
};
ol.inherits (ol.Graph, ol.Object);
