"use strict";

var grunt = require('grunt');

module.exports = function (fileName, options) {

	var done = this.async();
	var ramlPrser = require(process.cwd() + '/node_require/raml-js-parser/lib/raml');

	ramlPrser.loadFile(process.cwd() + '/src/api/definition/modules/session.raml').then(function(data) {

	grunt.file.write(process.cwd() + '/src/api/definition/modules/session-result.json', JSON.stringify(data, null, 4));
		done();
	}, function(error) {
		throw new Error(error);
	});

};