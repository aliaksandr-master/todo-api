"use strict";

module.exports = function (grunt) {
	var opt = this;

	var _ = require('lodash');

	this.run('jade', {
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
				return {
					_: _,
					read: function (path) {
						return grunt.file.read(opt.SRC + '/api-tester' + path);
					},
					rootUrl: ROOT_URI,
					homeUrl: ROOT_URI + '/index.html',
					navs: [
						{href: ROOT_URI + '/pages/tester/', text: 'Tester'},
						{href: ROOT_URI + '/pages/var/specs.html', text: 'Specs'},
						{href: ROOT_URI + '/pages/var/routes.html', text: 'Spec Options', nested: [
							{href: ROOT_URI + '/pages/var/filters.html', text: 'Available Filters'},
							{href: ROOT_URI + '/pages/var/rules.html', text: 'Available Validation Rules'},
							{href: ROOT_URI + '/pages/var/statuses.html', text: 'Available Spec Statuses'},
							{href: ROOT_URI + '/pages/var/types.html', text: 'Available Spec Types'}
						]},
						{href: ROOT_URI + '/pages/var/routes.html', text: 'Routes'}
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
		files: [{
			expand: true,
			src: [
				'**/*.jade',
				'!inc/**/*.jade'
			],
			cwd: opt.SRC + '/api-tester',
			dest: opt.BUILD + '/api-tester',
			ext: '.html'
		}]
	});

	this.run('clean', [
		opt.BUILD + '/api-tester/inc'
	]);

	this.run('less', {
		files: [
			{
				expand: true,
				cwd: opt.SRC + '/api-tester',
				src: [
					'**/*.less',
					'!inc/**/*.less'
				],
				dest: opt.BUILD + '/api-tester',
				ext: '.css'
			}
		]
	});

};