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
					rootUrl: ROOT_URI,
					homeUrl: ROOT_URI + '/_index.html',
					navs: [
						{href: ROOT_URI + '/page/var/specs.html', text: 'Specs'},
						{href: ROOT_URI + '/page/var/routes.html', text: 'Routes'},
						{href: ROOT_URI + '/page/var/routes.html', text: 'Spec Options', nested: [
							{href: ROOT_URI + '/page/var/filters.html', text: 'Available Filters'},
							{href: ROOT_URI + '/page/var/rules.html', text: 'Available Validation Rules'},
							{href: ROOT_URI + '/page/var/statuses.html', text: 'Available Spec Statuses'},
							{href: ROOT_URI + '/page/var/types.html', text: 'Available Spec Types'}
						]}

					],
					filter: grunt.file.readJSON(opt.VAR + '/api/filters.json'),
					specsSrc: specsSrc,
					specs: specs,
					specOptions: grunt.file.readJSON(opt.VAR + '/api/spec-options.json'),
					rules: grunt.file.readJSON(opt.VAR + '/api/rules.json'),
					routes: grunt.file.readJSON(opt.VAR + '/api/spec-routes.json')
				};
			}
		},
		files: [{
			expand: true,
			src: [ '**/*.jade' ],
			cwd: opt.SRC + '/api-tester/jade',
			dest: opt.BUILD + '/api-tester',
			ext: '.html'
		}]
	});

	this.run('less', {
		files: [
			{
				expand: true,
				cwd: opt.SRC + '/api-tester/static/styles',
				src: [
					'**/*.less'
				],
				dest: opt.BUILD + '/api-tester/static/styles',
				ext: '.css'
			}
		]
	});

};