module.exports = function(grunt) {
	'use strict';

	require('time-grunt')(grunt);
	require('matchdep').filter('grunt-*').forEach(grunt.loadNpmTasks);
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	var o = {};
	o.STORAGE_CACHE = 1;

	var projectName = 'listslider';

	var liveReloadPort = 35729;
	var liveReloadProjectUrl = '//www.'+projectName+':'+liveReloadPort+'/livereload.js';

	var watch = [
		'handlebars:compile',
		'concat:dev',
		'cssmin:dev',
		'replace:fonts_in_css',
		'clean:templates'
	];

	grunt.registerTask('install', [
		'clean:dev',
		'bower:install'
	]);

	grunt.registerTask('dev', [
		'clean:dev',
		'copy:dev',
		'replace:dev_index',
		'handlebars:compile',
		'concat:dev',
		'cssmin:dev',
		'replace:fonts_in_css',
		'clean:templates'
	]);

	grunt.registerTask("build", [
		'jshint:search_all',
		'dev',
		'uglify:dev_compile'
	]);

	grunt.registerTask('default', [
		'install',
		'dev'
	]);

	grunt.registerTask('dev_watch',[
		'dev',
		'replace:livereload',
		'file-creator:livereload',
		'watch:dev'
	]);

	grunt.initConfig({

		connect: {
			test: {
				options: {
					hostname: projectName,
					port: 8000,
					base: '.'
				}
			}
		},

		removelogging: {
			dev: {
				src: "client/js/app.js",
				dest: "client/js/app.js",

				options: {
				}
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
					'_src/**/*.js',
					'_src/**/*.css',
					'_src/**/*.hbs'
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
			options: {
				curly: true,
				eqeqeq: false,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				eqnull: true,
				browser: true,
				globals: {
					define: true,
					require: true,
					console: true
				}
			},
			'search_all' : {
				src: [
					'_src/**/*.js',
					'_src/*.js'
				]
			},
			gruntfile: {
				options: {
					globals: {
						console: true,
						require: true,
						module: true
					}
				},
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
				files: (function(){
					var dev_files = {};
					dev_files['client/css/styles.min.css'] = [
						'_src/vendor/bootstrap/custom/css/bootstrap.min.css',
						'_src/client/styles/styles.css'
					];
					return dev_files;
				})()
			}
		},

		concat: {
			dev: {
				files:{
					"client/js/app.js": [
						'bower_components/jquery/jquery.min.js',
						'bower_components/underscore/underscore.js',
						'bower_components/backbone/backbone.js',
						'bower_components/backbone.localStorage/backbone.localStorage.js',
						'bower_components/almond/almond.js',
						'_src/vendor/jqueryui/jquery-ui-1.10.3.custom/js/jquery-ui-1.10.3.custom.min.js',
						'_src/vendor/bootstrap/custom/js/bootstrap.min.js',
						'_src/vendor/handlebars.js',
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
					copy: false
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
						src: '_src/images/move.png',
						dest: 'client/images/move.png'
					},
					{
						expand: true,
						cwd: "_src",
						src: '**/*.{ttf,svg,eot,woff}',
						dest: "client/fonts/",
						flatten: true
					},
					{
						src: '_src/index.html',
						dest: 'client/index.html'
					}
				]
			}
		},

		replace: {
			fonts_in_css:{
				overwrite: true,
				src: [ 'client/css/styles.min.css' ],
				replacements: [
					{
						from: /url\s*\([^\)]+\)/i,
						to: function($0){
							$0 = $0.replace(/^url/,"");
							var url = $0.replace(/['"\s]+|\(|\)/,"").trim();

							var ext = url.split(".").pop();
							if(/woff|ttf|eot|svg/.test(ext) && !/svg/.test(ext) || /font/.test(url)){
								// FONTS
								var fileName = url.split(/[\/\\]+/).pop();
								url = '/client/fonts/'+fileName;
							}
							console.log('url:',url);
							return "url('"+url+"')";
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
			dev_index: {
				overwrite: true,
				src: [ 'client/index.html' ],
				replacements: [
					{
						from: '</head>',
						to: '<script>window.build="<%= grunt.template.today() %>";</script>\n</head>'
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