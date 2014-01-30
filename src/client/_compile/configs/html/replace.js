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
				this.BUILD + '/client/static/*.{html,css}',
				this.BUILD + '/client/static/**/*.{html,css}'
			],
			replacements: [
				{
					from: /(['"]\s*[\\\/]*)\s*client[^\\\/]+\//gi,
					to: '$1client-'+CACHE_KEY+'/'
				}
			]
		}
	};

};