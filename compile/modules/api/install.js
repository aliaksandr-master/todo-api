"use strict";

module.exports = function (grunt) {
	var path = this.path;

	this.config('clean', [
		path.BUILD + '/api'
	]);

};