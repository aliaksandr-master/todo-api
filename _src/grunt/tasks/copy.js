"use strict";
module.exports = function(grunt){

	return {

		options: {
			excludeEmpty: true
		},

		serverApi: {
			files: [
				{
					expand: true,
					cwd: "_src/api/",
					src: [
						'**/*',
						'*'
					],
					dest: "server/api/"
				}
			]
		},

		env_production: {
			files: [
				{
					expand: true,
					cwd: "client/",
					src: [
						'**/*',
						'*'
					],
					dest: "build_production/client/"
				},
				{
					expand: true,
					cwd: "_src/environment/production/",
					src: [
						'**/*',
						'*'
					],
					dest: "build_production/"
				},
				{
					src: '.htaccess',
					dest: "build_production/.htaccess"
				}
			]
		},

		env_testing: {
			files: [
				{
					expand: true,
					cwd: "_src/environment/testing/",
					src: [
						'**/*',
						'*'
					],
					dest: "build_testing/"
				}
			]
		},

		env_development: {
			files: [
				{
					expand: true,
					cwd: "_src/environment/development/",
					src: [
						'**/*',
						'*'
					],
					dest: "build_development/"
				}
			]
		},

		pictures: {
			files: [
				{
					expand: true,
					cwd: "_src/client/images/",
					src: [
						'**/*.{png,jpg,jpeg,gif,ico}',
						'*.{png,jpg,jpeg,gif,ico}'
					],
					dest: "client/images/"
				},
				{
					src: '_src/client/favicon.ico',
					dest: 'client/favicon.ico'
				}
			]
		},

		styles: {
			files: [
				{
					expand: true,
					cwd: "_src/client/",
					src: [
						'**/*.{css}',
						'*.{css}'
					],
					dest: "client/"
				}
			]
		},

		vendors: {
			files: [
				{
					expand: true,
					cwd: "_src/client/vendor",
					src: [
						'**/*',
						'*'
					],
					dest: "client/vendor"
				}
			]
		},

		scripts: {
			files: [
				{
					expand: true,
					cwd: "_src/client/js/",
					src: [
						'**/*.js',
						'*.js'
					],
					dest: "client/js/"
				}
			]
		},

		html: {
			files: [
				{
					expand: true,
					cwd: "_src/client/",
					src: [
						'**/*.{html,htm,xhtml}',
						'*.{html,htm,xhtml}',
					],
					dest: "client/",
					ext: '.html'
				}
			]
		},

		fonts: {
			files: [
				{
					expand: true,
					cwd: "_src/client/",
					src: '**/*.{ttf,svg,eot,woff}',
					dest: "client/fonts/",
					flatten: true
				}
			]
		}

	};

};