'use strict';

var _ = require('underscore');

module.exports = function(grunt, options){

	return {
		'client-routes': {
			options: {
				data: {
					routes: function() {
						return grunt.file.readJSON('src/client/static/config/route.json');
					}
				}
			},
			files: {
				'build/client/static/js/routes.js': 'src/client/_compile/configs/routing/route.template.txt'
			}
		}
	};

};