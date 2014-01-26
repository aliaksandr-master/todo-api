define(function(require, exports, module){
	"use strict";

	var _ = require('underscore');
	var Chaplin = require('chaplin');
	var Backbone = require('backbone');
	var preloader = require('lib/preloader');

	var utils = {};

	_.extend(utils, Chaplin.utils.beget(Chaplin.utils), {

		showPreloader: function(){
			preloader.on();
		},

		hidePreloader: function(){
			preloader.off();
		},

		concatPaths: function(one, two, sep){
			return (one||'').replace(/[\\\/]$/, '') + (sep || '/') + (two||'').replace(/^[\\\/]/, '');
		},

		makePath: function(path, sep){
			return ('/' + path).replace(/[\\\/]+/g, sep || '/').replace(/[\/]+$/g, '');
		},

		BackboneClass: function(proto, stat){

			function Child() {
				this.initialize.apply(this, arguments);
			}

			_.extend(Child.prototype, {
				initialize: function(){}
			}, Backbone.Event, Chaplin.EventBroker, proto);

			_.extend(Child, {
				extend: Backbone.Model.extend
			}, stat);

			return Child;
		}

	});

	return utils;
});