"use strict";
module.exports = function(grunt){

	return {

		options: {
//			excludeEmpty: true
		},

		build_to_client: {
			files: [
				{
					expand: true,
					cwd: "_temp/client/",
					src: [
						'**/*',
						'*'
					],
					dest: "client/"
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
					dest: "deploy/client/"
				},
				{
					expand: true,
					cwd: "api/",
					src: [
						'**/*',
						'*',
						'!var/cache/*',
						'!var/session/*'
					],
					dest: "deploy/api/"
				},
				{
					expand: true,
					cwd: "_env/prod/",
					src: [
						'**/*',
						'*'
					],
					dest: "build_production/"
				},
				{
					src: 'build/.htaccess',
					dest: "deploy/.htaccess"
				}
			]
		},

		env_testing: {
			files: [
				{
					expand: true,
					cwd: "_env/test/",
					src: [
						'**/*',
						'*'
					],
					dest: "deploy/"
				}
			]
		},

		env_development: {
			files: [
				{
					expand: true,
					cwd: "_env/dev/",
					src: [
						'**/*',
						'*'
					],
					dest: "deploy/"
				}
			]
		},

		pictures: {
			files: [
				{
					expand: true,
					cwd: "src/client/images/",
					src: [
						'**/*.{png,jpg,jpeg,gif,ico}',
						'*.{png,jpg,jpeg,gif,ico}'
					],
					dest: "client/images/"
				},
				{
					src: 'src/client/favicon.ico',
					dest: 'client/favicon.ico'
				}
			]
		},

		styles: {
			files: [
				{
					expand: true,
					cwd: "src/client/",
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
					cwd: "src/client/vendor",
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
					cwd: "src/client/js/",
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
					cwd: "src/client/",
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
					cwd: "src/client/",
					src: '**/*.{ttf,svg,eot,woff}',
					dest: "client/fonts/",
					flatten: true
				}
			]
		}

	};

};