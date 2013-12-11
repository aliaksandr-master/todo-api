module.exports = function(grunt) {
	'use strict';

	var _ = require('underscore');
	var pkg = grunt.file.readJSON('package.json');
	var date = Date.now();

	require('time-grunt')(grunt);

	require('matchdep').filter('grunt-*').forEach(grunt.loadNpmTasks);
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	var projectName = pkg.name;

	var liveReloadPort = 35729;
	var liveReloadProjectUrl = '//www.'+projectName+':'+liveReloadPort+'/livereload.js';

	grunt.registerTask('install', [
		'clean:dev',
		'bower:install'
	]);

	grunt.registerTask('dev', [
		'jshint:check_src',
		'jshint:gruntfile',
		'clean:dev',
		'copy:dev',
		'coffee:compile',
		'typescript:compile',
		'replace:dev_index',
		'replace:favicon',
		'handlebars:compile',
		'concat:dev',
		'cssmin:dev',
		'replace:fonts_in_css',
		'clean:templates',
		'replace:srcVersion'
	]);

	grunt.registerTask("build", [
		'jshint:search_all',
		'dev',
		'uglify:dev_compile'
	]);

	grunt.registerTask('default', [
		'dev'
	]);

	grunt.registerTask('dev_watch',[
		'dev',
		'replace:livereload',
		'file-creator:livereload',
		'watch:dev'
	]);

	var watch = [
		'handlebars:compile',
		'concat:dev',
		'cssmin:dev',
		'replace:fonts_in_css',
		'clean:templates'
	];

	grunt.initConfig({

		coffee: {
			compile: {
				expand: true,
				cwd: '_src/client',
				src: [
					'*.coffee',
					'**/*.coffee'
				],
				dest: 'temp/',
				ext: '.js'
			}
		},

		typescript: {
			compile: {
				expand: true,
				cwd: '_src/client/',
				src: [
					'*.ts',
					'**/*.ts'
				],
				dest: 'temp/',
				ext: '.js',
				options: {
					module: 'amd', //or 'commonjs'
					target: 'es5', //or 'es3'
					sourcemap: false,
					declaration: true
				}
			}
		},

		removelogging: {
			dev: {
				src: "client/js/app.js",
				dest: "client/js/app.js",
				options: {}
			}
		},

		uglify: {

			dev_compile: {
				options: {
					stripBanners: true
				},
				src:  'client/js/app.js',
				dest: 'client/js/app.js'
			},

			dev_compile_hbs: {
				expand: true,
				cwd: "client/templates",
				src: [
					'**/*.js'
				],
				dest: ''
			}
		},

		watch: {
			options: {
				livereload: liveReloadPort
			},
			dev: {
				files: [
					'_src/client/**/*.js',
					'_src/client/**/*.css',
					'_src/client/**/*.hbs'
				],
				tasks: watch
			}
		},

		'file-creator': {
			livereload: {
				"client/livereload.js": function(fs, fd, done){
					fs.writeSync(fd, ' ');
					done();
				}
			}
		},

		jshint: {
			options: _.extend(grunt.file.readJSON('.jshintrc'),{
				globals: {
					define: true,
					require: true,
					requirejs: true,
					console: true
				}
			}),
			'check_src' : {
				src: [
					'_src/client/js/**/*.js',
					'_src/client/js/*.js'
				]
			},
			gruntfile: {
				src: [
					'Gruntfile.js'
				]
			}
		},

		handlebars: {
			compile: {
				options: {
					namespace: 'JST',
					amd: false
				},
				files: [
					{
						expand: true,
						cwd: "_src/client/",
						src: ['templates/**/*.hbs'],
						dest: 'client/',
						ext: '.js'
					}
				]
			}
		},

		cssmin: {
			dev: {
				files: {
					'client/css/styles.min.css':[
						'_src/client/vendor/bootstrap/custom/css/bootstrap.min.css',
						'bower_components/jgrowl/jquery.jgrowl.css',
						'_src/client/styles/styles.css'
					]
				}
			}
		},

		concat: {
			dev: {
				files:{
					"client/js/app.js": [
						'bower_components/jquery/jquery.min.js',
						'bower_components/jgrowl/jquery.jgrowl.js',
						'bower_components/underscore/underscore.js',
						'bower_components/backbone/backbone.js',
						'bower_components/backbone.localStorage/backbone.localStorage.js',
						'bower_components/almond/almond.js',
						'_src/client/vendor/jqueryui/jquery-ui-1.10.3.custom/js/jquery-ui-1.10.3.custom.min.js',
						'_src/client/vendor/bootstrap/custom/js/bootstrap.min.js',
						'_src/client/vendor/handlebars.js',
						'_src/client/js/vendor_amd/**/*.js',
						'_src/client/js/vendor_amd/*.js',
						'_src/client/js/models/**/*.js',
						'_src/client/js/models/*.js',
						'_src/client/js/collections/**/*.js',
						'_src/client/js/collections/*.js',
						'_src/client/js/views/**/*.js',
						'_src/client/js/views/*.js',
						'client/templates/**/*.js',
						'_src/client/js/*.js'
					]
				}
			}
		},

		clean: {
			dev: [
				'client',
				'temp'
			],
			watched_css_js: [
				'client/js',
				'client/css'
			],
			templates: [
				'client/templates'
			]
		},

		bower: {
			install: {
				options: {
					install: true,
					verbose: true,
					copy: true,
					targetDir: 'temp/bower_components',
					cleanBowerDir: false,
					cleanTargetDir: false
				}
			}
		},

		copy: {

			options: {
				excludeEmpty: true
			},
			dev: {
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
						expand: true,
						cwd: "_src",
						src: '**/*.{ttf,svg,eot,woff}',
						dest: "client/fonts/",
						flatten: true
					},
					{
						src: '_src/client/index.html',
						dest: 'client/index.html'
					},
					{
						src: '_src/client/favicon.ico',
						dest: 'client/favicon.ico'
					}
				]
			}
		},

		replace: {
			fonts_in_css:{
				overwrite: true,
				src: [
					'client/css/styles.min.css'
				],
				replacements: [
					{
						from: /url\s*\([^\)]+\)/gi,
						to: function($0){
							$0 = $0.replace(/^url/,"");
							var url = $0.replace(/['"\s\(\)]+/g, "").trim();
							var fileName;
							// FONTS
							if(/\.(woff|ttf|eot|svg)/.test(url)){
								fileName = url.split(/[\/\\]+/).pop();
								url = '/client/'+date+'/fonts/'+fileName;
							}else if(/^[\/\\]*client\//.test(url) && /\.(png|jpg|jpeg|gif)/.test(url)){
								url = url.replace(/^([\/\\]*)client/,'//client/'+date+'/');
							}
//							console.log($0,'  url:',url);
							return "url('"+url+"')";
						}
					}
				]
			},
			srcVersion:{
				overwrite: true,
				src: [
					'client/index.html'
				],
				replacements: [
					{
						from: /['"]\s*\/*client\//gi,
						to: function($0){
							$0 = $0+date+'/';
							return $0;
						}
					}
				]
			},
			livereload: {
				overwrite: true,
				src: [ 'client/index.html' ],
				replacements: [
					{
						from: '</head>',
						to: '<script async src="'+liveReloadProjectUrl+'"></script></head>'
					}
				]
			},
			favicon:{
				overwrite: true,
				src: [ 'client/index.html' ],
				replacements: [
					{
						from: '<!--/meta-->',
						to: '<link rel="icon" href="/client/favicon.ico" type="image/x-icon"><!--/meta-->'
					}
				]
			},
			dev_index: {
				overwrite: true,
				src: [ 'client/index.html' ],
				replacements: [
					{
						from: '</head>',
						to: '<script>window.build='+date+';</script>\n</head>'
					},
					{
						from: '</head>',
						to: '<link type="text/css" rel="stylesheet" href="/client/css/styles.min.css"/>\n</head>'
					},
					{
						from: '</head>',
						to: '<script src="/client/js/app.js"></script>\n</head>'
					},
					{
						from: /<body>\s*<\/body>/,
						to: '<body></body>'
					},
					{
						from: /\n\s+/g,
						to: "\n"
					}
				]
			}
		}

	});

};