"use strict";

module.exports = function (grunt, options) {

	return {
		'database-default': {
			options: {
				config: grunt.file.readJSON(this.LOCAL + '/database.json')['default'],
				outputJSON:    this.COMPILED + '/database/default.scheme.json'
			}
		}
	};

};