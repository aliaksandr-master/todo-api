"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.run('mysql-schema', {
		options: {
			connection: opt.DEV + '/configs/database/default.json',
			outputJSON: opt.VAR + '/database/default.scheme.json'
		}
	});
};