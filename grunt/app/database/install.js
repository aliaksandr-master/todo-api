"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.run('mysql-schema', {
		options: {
			connection: opt.DEV + '/configs/database/default.json',
			outputJSON: opt.TMP + '/database/default.scheme.json'
		}
	});
};