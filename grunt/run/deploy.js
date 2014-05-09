"use strict";

module.exports = function (grunt) {
	var path = this;

	this.alias('dev', [
		"install",
		"build",
		"env/dev"
	], false);

	this.alias('prod', [
		"install",
		"build",
		"env/prod"
	], false);

	this.alias('test', [
		"install",
		"build",
		"env/test"
	], false);

};