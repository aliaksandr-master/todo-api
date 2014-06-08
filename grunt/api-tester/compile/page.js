'use strict';

module.exports = function (grunt) {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);

	var _ = require('lodash');

	this.clean([
		this.BUILD + '/api-tester/page'
	]);

	this.copy({
		options: {
			process: function (content) {
				var name = JSON.parse(content).database;
				content = grunt.file.read(opt.SRC + '/api-tester/inc/templates/page/database.jade');
				content = content.replace('/*FROM GRUNT TASK*/', name);
				return content;
			}
		},
		files: [
			{
				expand: true,
				cwd: opt.DEV + '/database/configs',
				src: '**/*.json',
				dest: opt.TMP + '/api-tester/page/database',
				ext: '.jade'
			}
		]
	});

	this.jade({
		options: {
			client: false,
			amd: false,
			pretty: true,
			debug: false,
			filters: {},
			data: function () {
				var ROOT_URI = '/api-tester';
				var specsSrc = grunt.file.readJSON(opt.VAR + '/api/specs-merged.json');
				var specs = _.cloneDeep(specsSrc);
				specs = _.groupBy(specs, 'controller');

				var dbs = grunt.file.expand([opt.DEV + '/database/configs/**/*.json']);

				var dbLinks = [];
				var dbConnections = {};
				_.each(dbs, function (fpath) {
					var connection = grunt.file.readJSON(fpath);
					var fileName = require('path').basename(fpath, '.json');
					dbConnections[connection.database] = {
						connection: connection,
						scheme: grunt.file.readJSON(opt.VAR + '/database/scheme/' + fileName + '.json')
					};
					dbLinks.push({
						href: ROOT_URI + '/page/database/' + fileName + '.html',
						text: connection.database
					});
				});

				return {
					_: _,
					formatJSON: require(opt.SRC + '/api-tester/static/js/lib/json-format.js'),
					read: function (path) {
						return grunt.file.read(opt.SRC + '/api-tester' + path);
					},
					db: dbConnections,
					rootUrl: ROOT_URI,
					homeUrl: ROOT_URI + '/page/',
					navs: [
						{href: ROOT_URI + '/page/var/specs/', text: 'Specs'},
						{href: ROOT_URI + '/page/database/', text: 'Database', nested: dbLinks},
						{href: ROOT_URI + '/page/var/routes/', text: 'Spec Options', nested: [
							{href: ROOT_URI + '/page/var/filters/', text: 'Available Filters'},
							{href: ROOT_URI + '/page/var/rules/', text: 'Available Validation Rules'},
							{href: ROOT_URI + '/page/var/statuses/', text: 'Available Spec Statuses'},
							{href: ROOT_URI + '/page/var/types/', text: 'Available Spec Types'}
						]},
						{href: ROOT_URI + '/page/var/routes/', text: 'Routes'}
					],
					filter: grunt.file.readJSON(opt.VAR + '/api/filters.json'),
					specsSrc: specsSrc,
					specs: specs,
					specOptions: grunt.file.readJSON(opt.VAR + '/api/spec-options.json'),
					rules: grunt.file.readJSON(opt.VAR + '/api/rules.json'),
					specRoutes: grunt.file.readJSON(opt.VAR + '/api/spec-routes.json'),
					routes: grunt.file.readJSON(opt.VAR + '/api/router/routes.json')
				};
			}
		},
		files: [
			{
				expand: true,
				src: [
					'**/*.jade',
					'!inc/**/*.jade'
				],
				cwd: opt.SRC + '/api-tester',
				dest: opt.BUILD + '/api-tester',
				ext: '.html'
			},
			{
				expand: true,
				src: [
					'**/*.jade',
					'!inc/**/*.jade'
				],
				cwd: opt.TMP + '/api-tester/page',
				dest: opt.BUILD + '/api-tester/page',
				ext: '.html'
			}
		]
	});

};