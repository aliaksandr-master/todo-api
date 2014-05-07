"use strict";

var _ = require('lodash');

module.exports = function(grunt, options){
	var path = this.path;

	return {
		'client-routes': {
			options: {
				data: {
					routes: function() {
						return require(path.CWD + 'src/client/static/config/route.json');
					}
				}
			},
			files: {
				'build/client/static/js/routes.js': this.GRUNT + '/modules/client/configs/routing/route.template.txt'
			}
		}
	};

};