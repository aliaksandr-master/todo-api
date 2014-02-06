"use strict";
module.exports = function(grunt, options){

	var _ = require('underscore');
	var pkg = options.package;
	var cfg = options;

	var CACHE_KEY = options.cacheKey;

	return {

		'client-index-static-version': {
			overwrite: true,
			src: [
				this.BUILD + '/client/static/index.html'
			],
			replacements: [
				{
					from: 'static/',
					to: 'static-' + CACHE_KEY + '/'
				}
			]
		}
	};

};