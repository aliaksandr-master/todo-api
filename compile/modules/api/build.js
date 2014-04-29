"use strict";


module.exports = function (grunt) {

	this.alias("build", [
		'api/realization',
		"api/specs",
		"api/router"
	]);

};