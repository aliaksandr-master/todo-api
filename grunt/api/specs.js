"use strict";

module.exports = function (grunt) {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);

	var _ = require('lodash');
	var sha1 = require('sha1');
	var json2php = opt.utils.json2php;

	this
		.findPhpMethods('rules', {
			options: {
				filter: function (method) {
					return /^rule_.+$/.test(method.name);
				},
				processResult: function (result) {
					return _.map(result, function (method) {
						return method.name.replace(/^rule_+/, '');
					});
				}
			},
			files: [{
				expand: true,
				cwd: opt.SRC + '/api',
				src: [
					'**/*.php'
				],
				dest: opt.VAR + '/api/rules',
				ext: '.json'
			}]
		})

		.jsonMerge('rules', {
			options: {
				array: true
			},
			files: [{
				expand: true,
				cwd: opt.VAR + '/api/rules',
				src: [ '**/*.json' ],
				dest: opt.VAR + '/api/rules.json'
			}]
		})

		.clean('rules', [
			opt.VAR + '/api/rules'
		])

		.findPhpMethods('filters', {
			options: {
				filter: function (method) {
					return /^filter_.+$/.test(method.name);
				},
				processResult: function (result) {
					return _.map(result, function (method) {
						return method.name.replace(/^filter_+/, '');
					});
				}
			},
			files: [
				{
					expand: true,
					cwd: opt.SRC + '/api',
					src: [
						'**/*.php'
					],
					dest: opt.VAR + '/api/filters',
					ext: '.json'
				}
			]
		})

		.jsonMerge('filters', {
			options: {
				array: true
			},
			files: [{
				expand: true,
				cwd: opt.VAR + '/api/filters',
				src: [ '**/*.json' ],
				dest: opt.VAR + '/api/filters.json'
			}]
		})

		.clean('filters', [
			opt.VAR + '/api/filters'
		])

		.jshint({
			src: [ opt.SRC + '/api/controllers/**/*.spec.{js,json}' ]
		})

		.apiSpecsCompiler({
			options: {
				beauty: true,
				verbose: false,
				runtimeOptions: function () {
					var specOptions = require(opt.SRC + '/api/controllers/spec-options.js');
					return {
						types:    specOptions.types,
						rules:    grunt.file.readJSON(opt.VAR + '/api/rules.json'),
						filters:  grunt.file.readJSON(opt.VAR + '/api/filters.json'),
						statuses: specOptions.statuses
					};
				}
			},

			files: [{
				expand: true,
				flatten: true,
				cwd: opt.SRC + '/api/controllers',
				src: [
					'**/*.spec.{json,raml,yaml,js}'
				],
				ext: '.json',
				dest: opt.VAR + '/api/specs/'
			}]
		})

		.jsonMerge('make-common', {
			files: [{
				expand: true,
				cwd: opt.VAR + '/api/specs/',
				src: '**/*.json',
				dest: opt.VAR + '/api/specs-merged.json'
			}]
		})

		.splitFiles('spec-routes', {
			options: {
				process: function (content, fpath, dest, fileObj) {
					var result = [];

					_.each(content, function (val, key) {
						if (!_.isEmpty(val.routes)) {
							result = result.concat(val.routes);
						}
					});

					var files = {};

					files[opt.VAR + '/api/spec-routes.json'] = result;

					return files;
				}
			},

			files: [{
				src: opt.VAR + '/api/specs-merged.json',
				dest: opt.VAR + '/api/'
			}]
		})

		.jsonProcess('clean', {
			options: {
				process: function (content, fpath, dest, fileObj) {
					_.each(content, function (obj) {
						delete obj.routes;
						delete obj.title;
						delete obj.dsc;
						delete obj.description;
						delete obj.fpath;
					});
					return content;
				}
			},
			files: [{
				expand: true,
				cwd: opt.VAR + '/api/specs',
				src: '**/*.json',
				dest: opt.VAR + '/api/specs'
			}]
		})

		.php_router_gen('specs', {
			options: {
				map: function () {
					var json = grunt.file.readJSON(opt.VAR + '/api/specs-merged.json');
					var result = {};

					_.each(json, function (data, name) {
						result[name] = {};
					});

					return result;
				},

				aliases: {
					"": "[^\/]+",
					"decimal": "[0-9]+"
				},

				parse: function (fileContent) {

					var routes = [];

					var rows = fileContent
						.trim()
						.replace(/^\s+/mg, '').replace(/\s+$/mg, '')
						.replace(/\s*->\s*([^\s]*)$/gm, '  $1')
						.split(/\n\s*/);

					_.each(rows, function (row) {
						row = row.replace(/#.+$/, '');

						if (!row.length) {
							return;
						}

						var rowObj = {
							name: null,
							method: null,
							url: null
						};

						var rowSegments = row.trim().split(/\s+/);

						var root = '/api/';

						if (rowSegments.length === 3) {
							rowObj.method = rowSegments[0];
							rowObj.url = rowSegments[1];
							rowObj.name = rowSegments[2];
						} else if (rowSegments.length === 2) {
							rowObj.method = null;
							rowObj.url = rowSegments[0];
							rowObj.name = rowSegments[1];
						}

						if (rowObj.url) {
							rowObj.url = rowObj.url.trim();
							if (!/^\/.+$/.test(rowObj.url)) {
								rowObj.url = root + rowObj.url;
							}
						}

						routes.push(rowObj);
					});
					return routes; // must be [{method: 'get', url: '/needed/url/string', name: 'resource.name'}]
				},
				caseSensitive: true,
				unicodeSensitive: true,
				trailingSensitive: false,
				beautify: true
			},
			files: [{
				src: opt.SRC + '/api/routes.txt',
				dest: opt.VAR + '/api/router/routes.json'
			}]
		})

		.php_router_gen('router', {
			options: {
				map: function () {
					var json = grunt.file.readJSON(opt.VAR + '/api/specs-merged.json');
					var result = {};

					_.each(json, function (data, name) {
						result[name] = {};
					});

					return result;
				},
				aliases: {
					"": "[^\/]+",
					"decimal": "[0-9]+"
				},
				caseSensitive: true,
				unicodeSensitive: true,
				trailingSensitive: false,
				beautify: false
			},
			files: [{
				expand: true,
				cwd: opt.VAR + '/api',
				src: 'spec-routes.json',
				dest: opt.VAR + '/api/router/'
			}]
		})

		.jsonMerge({
			options: {
				array: true
			},
			files: [{
				src: [
					opt.VAR + '/api/router/spec-routes.json',
					opt.VAR + '/api/router/routes.json'
				],
				dest: opt.VAR + '/api/router/routes.json'
			}]
		})

		.clean('excess-router', [
			opt.VAR + '/api/router/spec-routes.json'
		])

		.splitFiles('specs', {
			options: {
				process: function (content, fpath, dest, fileObj) {
					var result = {};

					var destDir = fileObj.orig.dest.replace(/\/$/, '');

					_.each(content, function (obj, key) {
						result[destDir + '/' + sha1(key) + '.php'] = '<?php \nreturn ' + json2php(obj) + ';';
					});

					return result;
				}
			},
			files: [{
				expand: true,
				cwd: opt.VAR + '/api/specs/',
				src: [
					'**/*.json'
				],
				dest: opt.BUILD + '/api/var/specs/',
				ext: '.php'
			}]
		})

		.jsToJSON({
			files: [{
				expand: true,
				flatten: true,
				cwd: opt.SRC + '/api/',
				src: [
					'controllers/spec-options.js'
				],
				dest: opt.VAR + '/api/',
				ext: '.json'
			}]
		});

};