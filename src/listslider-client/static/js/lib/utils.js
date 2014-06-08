define(function(require, exports, module){
	'use strict';

	var _ = require('underscore');
	var Chaplin = require('chaplin');
	var Backbone = require('backbone');
	var preloader = require('lib/preloader');

	var utils = {};

	_.extend(utils, Chaplin.utils.beget(Chaplin.utils), {

		showPreloader: function(){
			preloader.on();
		},

		hidePreloader: function () {
			preloader.off();
		},

		showServerError: function () {
			window.console && console.error('ERROR!');
		},

		concatPaths: function (root) {
			var DS = '/';
			_.each(Array.prototype.slice.call(arguments, 1), function (v) {
				if (v != null) {
					root = (root || '').replace(/[\\\/]$/, '') + DS + (v || '').replace(/^[\\\/]/, '');
				}
			});
			return root;
		},

		makePath: function(path, sep){
			return ('/' + path).replace(/[\\\/]+/g, sep || '/').replace(/[\/]+$/g, '');
		},

		BackboneClass: function(proto, stat){

			function MyChild () {
				this.initialize.apply(this, arguments);
			}

			_.extend(MyChild, {
				extend: Backbone.Model.extend
			}, stat);

			_.extend(MyChild.prototype, Backbone.Events, Chaplin.EventBroker, {
				initialize: function () { }
			}, proto);

			return MyChild;
		}

	});

	return utils;
});