define(function(require, exports, module){
	"use strict";

	var Chaplin = require('chaplin');
	var _ = require('underscore');

	var preloader = require('lib/preloader');
	var BaseCollection = Chaplin.Collection.extend({

		isCollection: true,

		format: "json",

		initialize: function(models, options){
			options = options || {};

			if(options.propModel){
				options = _.clone(options);
				this.propModel = options.propModel;
				delete options.propModel;
			}

			BaseCollection.__super__.initialize.apply(this, arguments);
		},

		remote: true, // DualStorage option

		local: true,   // DualStorage option

		dispose: function(){
			this.propModel = {};
			return BaseCollection.__super__.dispose.apply(this, arguments);
		},

		clean: function(){
			while (this.length) {
				this.first().destroy.apply(arguments);
			}
			return this;
		}

	});

	return BaseCollection;
});