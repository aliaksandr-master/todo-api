define(function(require, exports, module){
    "use strict";

    var utils		= require('lib/utils');
    var _			= require('underscore');
    var $			= require('jquery');
    var Backbone	= require('backbone');
    var Chaplin		= require('chaplin');

	var noXhrPatch = typeof window !== 'undefined' && !!window.ActiveXObject && !(window.XMLHttpRequest && (new XMLHttpRequest()).dispatchEvent);

	var BaseServer = utils.BackboneClass({}, {

		ajax: function (options) {
			return $.ajax(options);
		}

	});

    return BaseServer;
});