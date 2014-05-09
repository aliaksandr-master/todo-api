"use strict";

module.exports = function (grunt) {
	var path = this.path;

	this.run('clean', [
		path.BUILD + '/api'
	]);

};