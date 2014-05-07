"use strict";

var _ = require('lodash');

module.exports = function(grunt, options){

	return {
		'client-routes': {
			options: {
				data: {
					routes: function() {
						return require(global.ROOT + 'src/client/static/config/route.json');
					}
				}
			},
			files: {
				'build/client/static/js/routes.js': this.COMPILE + '/modules/client/configs/routing/route.template.txt'
			}
		}
	};

};