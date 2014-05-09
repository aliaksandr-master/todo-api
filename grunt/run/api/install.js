"use strict";

module.exports = function (grunt) {
	var path = this;

	this.run('clean', [
		path.BUILD + '/api'
	]);

};