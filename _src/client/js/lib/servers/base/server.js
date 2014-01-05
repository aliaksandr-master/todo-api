define(function(require, exports, module){
    "use strict";

    var utils		= require('lib/utils');
    var _			= require('underscore');
    var Backbone	= require('backbone');
    var Chaplin		= require('chaplin');

	var noXhrPatch = typeof window !== 'undefined' && !!window.ActiveXObject && !(window.XMLHttpRequest && (new XMLHttpRequest()).dispatchEvent);

	var BaseServer = utils.BackboneClass({

		methodMap: {
			'read':		'GET',
			'create':	'POST',
			'update':	'PUT',
			'delete':	'DELETE',
			'patch':	'PATCH'
		},

		urlError: function() {
			throw new Error('A "url" property or function must be specified');
		},

		sync: function (syncObject, method, model, options) {

		}

	});

    return BaseServer;
});