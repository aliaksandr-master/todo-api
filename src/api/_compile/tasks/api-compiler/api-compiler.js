"use strict";
module.exports = function(grunt){

	var SRC = this.SRC;
	var ROOT = this.ROOT;

	return function () {

		var _ = require('lodash');
		var json2phpArray = require(SRC + '/_compile/utils.js').json2phpArray;
		var sha1 = require('sha1');

		var options = require(SRC + '/api/definition/options.js');

		var mainOptions = {
			cwd: 'src/api/definition/modules/',
			src: [
				'**/*.{js,raml,json}'
			],
			jsonSpaces: 4,
			apiRoot: '/api',
			verbose: false,
			destSourceJsonFile: 'build/api/var/api.source.json',
			destParsedJsonFile: 'build/api/var/api.parsed.json',
			varDir: 'build/api/var/',
			configDir: 'configs/',
			sysDir: 'system/'
		};

		mainOptions.cwd = mainOptions.cwd.replace(/[\\\/]*$/, '');

		var parsers = {
			json: require('./_parsers/json'),
			js:   require('./_parsers/json'),
			raml: require('./_parsers/raml')
		};

		var fs = grunt.file.expand({ cwd: mainOptions.cwd }, mainOptions.src);
		var source = {};
		var parsed = {};

		_.each(fs, function(fpath){

			var allowCondition = _.all(fpath.split(/[\\\/]+/), function (v) {
				return !/^_.+$/.test(v);
			});

			if (allowCondition) {
				var ext = fpath.split('.').pop();
				var file = ROOT + '/' + mainOptions.cwd + '/' + fpath;
				var parsedObj = parsers[ext].call(grunt, file, options, mainOptions);

				_.extend(source, parsedObj.source);
				_.extend(parsed, parsedObj.parsed);
			}
		});

		_.each(parsed, function (value, name) {
			var file = mainOptions.varDir + mainOptions.sysDir + sha1(name) +'.php';
			grunt.file.write(file, '<?php \nreturn ' + json2phpArray(value) + ';');
			grunt.log.ok(value.name + ', File: ' + file);
		});

		var methodsFile  = mainOptions.varDir + mainOptions.configDir + sha1('methods') +'.php';
		grunt.file.write(methodsFile, '<?php \nreturn ' + json2phpArray(options.methods) + ';');
		grunt.log.ok('File of methods : ' + methodsFile,' was created');

		grunt.file.write(mainOptions.destSourceJsonFile, JSON.stringify(source, null, mainOptions.jsonSpaces));
		grunt.file.write(mainOptions.destParsedJsonFile, JSON.stringify(parsed, null, mainOptions.jsonSpaces));

		grunt.log.ok('File ' + mainOptions.destSourceJsonFile,' was created');
		grunt.log.ok('File ' + mainOptions.destParsedJsonFile,' was created');
		grunt.log.ok('Total: ' + _.keys(parsed).length + ' items');
	};

};