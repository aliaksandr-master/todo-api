"use strict";

module.exports = function (grunt) {
	var path = this.path;

	this.alias('dev', [
		"install",
		"build",
		"env/dev"
	]);

	this.alias('prod', [
		"install",
		"build",
		"env/prod"
	]);

	this.alias('test', [
		"install",
		"build",
		"env/test"
	]);

	this.alias([
		"install",
		"build",
//		"clean:client-deploy",
//		"cssmin:client-compress-all",
//		"copy:client-build-to-deploy",
//		"requirejs:client-compile",
//		"copy:client-deploy-to-build"
	]);

};