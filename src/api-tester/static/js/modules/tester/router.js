define(function(require){
    'use strict';

	var $ = require('jquery');
	var URI = require('URIjs/URI');
	var Backbone = require('backbone');
	var Tester = require('modules/tester/tester');

	var SpecRouter = Backbone.Router.extend({

		routes: {
			"help":                 "help",    // #help
			"search/:query":        "search",  // #search/kiwis
			"search/:query/p:page": "search"   // #search/kiwis/p7
		},

		initialize: function () {
			var r = SpecRouter.__super__.initialize.apply(this, arguments);

			this.form = new Tester(this, $('#api-tester'), window.API_JSON, window.API_ROUTES_JSON);

			return r;
		},

		addParam: function (name, value) {
			var uri = URI(window.location.href);
			uri.addQuery(name, value);
			this.navigate(this._urlStringToNavigate(uri), {trigger: true});
		},

		removeParam: function (name) {
			var uri = URI(window.location.href);
			uri.removeQuery(name);
			this.navigate(this._urlStringToNavigate(uri), {trigger: true});
		},

		replaceParam: function (name, value) {
			var uri = URI(window.location.href);
			uri.removeQuery(name);
			uri.addQuery(name, value);
			this.navigate(this._urlStringToNavigate(uri), {trigger: true});
		},

		_urlStringToNavigate: function (uri) {
			return uri.path() + '?' + uri.query();
		}

	});

	return SpecRouter;

});