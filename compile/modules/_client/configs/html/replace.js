"use strict";
module.exports = function(grunt, options){

	var CACHE_KEY = options.buildTimestamp;

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