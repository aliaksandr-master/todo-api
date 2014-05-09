"use strict";

module.exports = function (grunt) {
	var path = this;

	var _ = require('lodash');
	var sha1 = require('sha1');
	var json2php = require(path.GRUNT + "/utils/json2php.js");

	this

		.run('jshint', {
			src: [
				path.SRC + '/api/controllers/**/*.spec.{js,json}'
			]
		})

		.run('api-specs-compiler', {
			options: _.extend({
				beauty: true,
				verbose: false
			}, require(path.SRC + '/api/controllers/spec-options.js')),

			files: [
				{
					expand: true,
					flatten: true,
					cwd: path.SRC + '/api/controllers',
					src: [
						'**/*.spec.{json,raml,yaml,js}'
					],
					ext: '.json',
					dest: path.TMP + '/api/specs/'
				}
			]
		})

		.run('json-merge:make-common', {
			options: {
				outputJSON: path.TMP + '/api/specs-merged.json'
			},
			files: [
				{
					expand: true,
					cwd: path.TMP + '/api/specs/',
					src: '**/*.json'
				}
			]
		})

		.run('split-files:spec-routes', {
			options: {
				process: function (content, fpath, dest, fileObj) {
					var result = [];

					_.each(content, function (val, key) {
						if (!_.isEmpty(val.routes)) {
							result = result.concat(val.routes);
						}
					});

					var files = {};

					files[path.TMP + '/api/spec-routes.json'] = result;

					return files;
				}
			},

			files: [{
				src: path.TMP + '/api/specs-merged.json',
				dest: path.TMP + '/api/'
			}]
		})

		.run('json-process:clean', {
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
				cwd: path.TMP + '/api/specs',
				src: '**/*.json',
				dest: path.TMP + '/api/specs'
			}]
		})

		.run('php_router_gen:specs', {
			options: {

				map: function () {
					var json = grunt.file.readJSON(path.TMP + '/api/specs-merged.json');
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
			files: [
				{
					src: path.SRC + '/api/routes.txt',
					dest: path.TMP + '/api/router/routes.json'
				}
			]
		})

		.run('php_router_gen:router', {
			options: {

				map: function () {
					var json = grunt.file.readJSON(path.TMP + '/api/specs-merged.json');
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
			files: [
				{
					expand: true,
					cwd: path.TMP + '/api',
					src: 'spec-routes.json',
					dest: path.TMP + '/api/router/'
				}
			]
		})

		.run('json-merge', {
			options: {
				outputJSON: path.TMP + '/api/router/routes.json',
				array: true
			},
			files: [
				{src: path.TMP + '/api/router/spec-routes.json'},
				{src: path.TMP + '/api/router/routes.json'}
			]
		})

		.run('clean:excess-router', [
			path.TMP + '/api/router/spec-routes.json'
		])



		.run('split-files:specs', {
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
				cwd: path.TMP + '/api/specs/',
				src: [
					'**/*.json'
				],
				dest: path.BUILD + '/api/var/specs/',
				ext: '.php'
			}]
		})

		.run('js-to-json', {
			files: [
				{
					expand: true,
					flatten: true,
					cwd: path.SRC + '/api/',
					src: [
						'controllers/spec-options.js'
					],
					dest: path.TMP + '/api/',
					ext: '.json'
				}
			]
		});

};