"use strict";
module.exports = function(grunt, options){

	var _ = require('lodash');

	var configs = {
		config: options,
		options: options,
		package: options.package || {},
		build: options.build || {}
	};

	return {

		'client-match-config': {
			src: [
				this.BUILD + '/client/static/js/**/*.{js,html,css}',
				this.BUILD + '/client/static/js/*.{js,html,css}',
				this.BUILD + '/client/static/*.{js,html,css}'
			],
			overwrite: true,
			replacements: [{
				from: /\$\{(config|build|options|package):([^\}]+)\}/g,
				to: function (word, _i, _f, matches) {
					var config = configs[matches[0]],
						name = matches[1],
						value = _.reduce(name.split('.'), function(config, name) {
							return config != null ? config[name] : null;
						},config);

					if (value == null) {
						console.error('Configuration variable "' + name + '" is not defined in config files!');
						grunt.fail();
					}
					return value;
				}
			}]
		}

	};

};