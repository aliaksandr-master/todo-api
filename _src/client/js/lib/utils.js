define(function(require, exports, module){
	"use strict";

	var _ = require('underscore');
	var Chaplin = require('chaplin');
	var Backbone = require('backbone');

	var utils = {};

	_.extend(utils, Chaplin.utils.beget(Chaplin.utils), {

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