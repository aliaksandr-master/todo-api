define(function(require, exports, module){
	'use strict';

	var Chaplin = require('chaplin');
	var _ = require('underscore');

	var preloader = require('lib/preloader');
	var BaseCollection = Chaplin.Collection.extend({

		isCollection: true,

		format: "json",

		remote: true, // DualStorage option

		local: true,   // DualStorage option

		initialize: function(models, options){
			options = options || {};

			this.requestMeta = [];

			if(options.propModel){
				options = _.clone(options);
				this.propModel = options.propModel;
				delete options.propModel;
			}

			BaseCollection.__super__.initialize.apply(this, arguments);
		},

		dispose: function(){
			this.propModel = null;
			return BaseCollection.__super__.dispose.apply(this, arguments);
		},

		parse: function (resp, f1, f2, f3) {
			this.requestMeta.push(resp.meta);
			return BaseCollection.__super__.parse.call(this, resp.data, f1, f2, f3);
		}

	});

	return BaseCollection;
});