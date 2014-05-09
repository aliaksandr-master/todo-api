"use strict";

module.exports = function (grunt) {
	var path = this.path;

	this.run('mysql-schema', {
		options: {
			connection: path.DEV + '/configs/database/default.json',
			outputJSON: path.TMP + '/database/default.scheme.json'
		}
	});
};