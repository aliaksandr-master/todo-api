"use strict";

var _ = require('lodash');

module.exports = function (grunt) {

	return {
		'api-router': {
			options: {

				map: function () {
					var json = grunt.file.readJSON(global.SRC + '/api/router/handler.cascade.json');

					var getAllResources = function (currObj, _prevName, options, _result) {
						options = options || {};

						_result   = _result == null ? {} : _result;
						_prevName = _prevName == null ? '' : _prevName + '.';

						var resourceNodeExp = /^<([^>]+)>$/;

						var resources = {};
						_.each(currObj, function (v, k) {
							if (resourceNodeExp.test(k)) {
								resources[_prevName + k.replace(resourceNodeExp, '$1')] = v;
							} else {
								options[k] = v;
							}
						});

						_.each(resources, function (v, name) {
							_result[name] = getAllResources(v, name, _.clone(options), _result).options;
						});

						return {
							options: options,
							result: _result
						};
					};

					return getAllResources(json).result;
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
					expand: true,
					cwd: this.SRC + '/api/router/',
					src: 'routes.txt',
					dest: this.COMPILED + '/api-router/',
					ext: '.json'
				}
			]
		}
	};
};