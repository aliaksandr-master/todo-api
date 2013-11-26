module.exports = function(grunt) {
    'use strict';

    require('time-grunt')(grunt);
    require('matchdep').filter('grunt-*').forEach(grunt.loadNpmTasks);
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    var _ = require("underscore");

    var o = {};
    o.STORAGE_CACHE = 1;

    var projectName = 'listslider';
    var liveReloadPort = 35729;
    var liveReloadProjectUrl = '//www.'+projectName+':'+liveReloadPort+'/livereload.js';

    var watch = [
        'jshint:search_all',
        'handlebars:compile',
        'concat:dev',
        'cssmin:dev'
    ];

    grunt.registerTask('default', [
        'jshint:search_all',
        'jshint:gruntfile',
        'clean:dev',
        'bower:install'
    ]);

    grunt.registerTask('dev', [
        'jshint:search_all',
        'clean:dev',
        'copy:dev',
        'copy:server',
        'copy:livereload',
        'replace:dev_index',
        'replace:livereload',
        'handlebars:compile',
        'concat:dev',
        'cssmin:dev',
        'replace:fonts_in_css',
        'watch:dev'
    ]);

    grunt.registerTask("build", [
        'jshint:search_all',
        'clean:dev',
        'copy:dev',
        'replace:dev_index',
        'handlebars:compile',
        'concat:dev',
        'removelogging:dev',
        'uglify:dev_compile',
        'cssmin:dev',
        'replace:fonts_in_css'
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
                src: "build/client/js/app.js",
                dest: "build/client/js/app.js",

                options: {
                    // see below for options. this is optional.
                }
            }
        },

        requirejs: {

            compile: {
                options: {
                    appDir: 'build/client',
                    baseUrl: 'js',
                    dir: 'build/client',
                    modules: [
                        {
                            name: 'main',
                            include: _(grunt.file.expandMapping(['controllers/**/*.js'], '',
                                {
                                    cwd: 'build/client/js',
                                    rename: function(base, path) {
                                        return path.replace(/\.js$/, '');
                                    }
                                }
                            )).pluck('dest'),
                            insertRequire: ['main']
                        }
                    ],
                    mainConfigFile: 'build/client/js/config.js',
                    almond: true,
                    optimize: 'uglify2',
                    useStrict: true,
                    //					keepBuildDir: true,
                    preserveLicenseComments: false,
                    generateSourceMaps: true
                }
            }

        },

        uglify: {
            dev_compile: {
                options: {
                    stripBanners: true
                },
                src:  'build/client/js/app.js',
                dest: 'build/client/js/app.js'
            },

            dev_compile_hbs: {
                expand: true,
                cwd: "build/client/templates",
                src: [
                    '**/*.js'
                ],
                dest: ''
            }
        },

        watch: {
            options: { livereload: liveReloadPort },
            dev: {
                files: [
                    'src/**/*.js',
                    'src/**/*.css',
                    'src/**/*.hbs'
                ],
                tasks: watch
            }
        },

        less: {
            dev_compile: {
                options: {
                    paths: ["src/client/styles/"],
                    cleancss: true
                },
                files: {
                    "build/client/css/less_compiled.css": ["src/client/styles/**.less"]
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
                    'src/client/js/**/*.js',
                    'src/client/js/*.js'
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
                        cwd: "src/client/",
                        src: ['templates/**/*.hbs'],
                        dest: 'build/client/',
                        ext: '.js'
                    }
                ]
            }
        },

        cssmin: {
            dev: {
                files: (function(){
                    var dev_files = {};
                    dev_files['build/client/css/styles.min.css'] = [
                        'src/vendors/bootstrap/custom/css/bootstrap.min.css',
                        'src/client/styles/styles.css'
                    ];
                    return dev_files;
                })()
            }
        },

        concat: {
            dev: {
                files:{
                    "build/client/js/app.js": [
                        'vendors/jquery/jquery.js',
                        'vendors/underscore/underscore.js',
                        'vendors/backbone/backbone.js',
                        'vendors/backbonelocalStorage/backbone.localStorage.js',
                        'src/vendors/jqueryui/jquery-ui-1.10.3.custom/js/jquery-ui-1.10.3.custom.min.js',
                        'src/vendors/bootstrap/custom/js/bootstrap.min.js',
                        'vendors/almond/almond.js',
//                            'vendors/requirejs/require.js',
                        'src/vendors/handlebars.js',
                        'src/client/js/vendors_amd/*.js',
                        'src/client/js/abstracts/**/*.js',
                        'src/client/js/models/**/*.js',
                        'src/client/js/collections/**/*.js',
                        'src/client/js/views/**/*.js',
                        'build/client/templates/**/*.js',
                        'src/client/js/*.js'
                    ]
                }
            }
        },

        clean: {
            dev: 'build',
            watched_css_js: [
                'build/client/js',
                'build/client/css'
            ]
        },

        bower: {
            install: {
                options: {
                    targetDir: 'vendors',
                    cleanTargetDir: true,
                    cleanBowerDir: false,
                    verbose: true,
                    install: true,
                    layout: function(type, component) {
                        return component.replace('.', '');
                    }
                }
            }
        },

        autoprefixer: {
            options: {
                browsers: ['> 1%', 'last 3 versions', 'ff > 17', 'ie >= 8', 'opera 12']
            },

            // just prefix the specified file
            single_file: {
                src: 'src/css/file.css',
                dest: 'build/client/css/file.css'
            },

            // prefix all specified files and save them separately
            multiple_files: {
                expand: true,
                flatten: true,
                src: 'src/css/*.css', // -> src/css/file1.css, src/css/file2.css
                dest: 'build/css/' // -> dest/css/file1.css, dest/css/file2.css
            },

            // prefix all specified files and concat them into the one file
            concat: {
                src: 'src/css/*.css', // -> src/css/file1.css, src/css/file2.css
                dest: 'build/css/concatenated.css' // -> dest/css/concatenated.css
            },

            // if you specify only `src` param, the destination will be set automatically,
            // so specified source files will be overwrited
            no_dest: {
                src: 'build/css/file.css' // globbing is also possible here
            }
        },

        copy: {

            options: {
                excludeEmpty: true
            },

            livereload: {
                files: [
                    {
                        src: 'utils/livereload.js',
                        dest: 'build/livereload.js'
                    }
                ]
            },
            server: {
                files:{
                    src: 'src/node_server.js',
                    dest: 'build/node_server.js'
                }
            },
            dev: {
                files: [
                    {
                        src: 'src/client/images/move.png',
                        dest: 'build/client/images/move.png'
                    },
                    {
                        src: 'src/.htaccess',
                        dest: 'build/.htaccess'
                    },
                    {
                        expand: true,
                        cwd: "src",
                        src: '**/*.{ttf,svg,eot,woff}',
                        dest: "build/client/fonts/",
                        flatten: true
                    },
                    {
                        src: 'src/index.html',
                        dest: 'build/index.html'
                    }
                ]
            }
        },

        replace: {
            fonts_in_css:{
                overwrite: true,
                src: [ 'build/client/css/styles.min.css' ],
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
                src: [ 'build/index.html' ],
                replacements: [
                    {
                        from: '</head>',
                        to: '<script async src="'+liveReloadProjectUrl+'"></script></head>'
                    }
                ]
            },
            dev_index: {
                overwrite: true,
                src: [ 'build/index.html' ],
                replacements: [
                    {
                        from: '</head>',
                        to: '<script>window.build="<%= grunt.template.today() %>";</script></head>'
                    },
                    {
                        from: '</head>',
                        to: '<link type="text/css" rel="stylesheet" href="/client/css/styles.min.css"/></head>'
                    },
                    {
                        from: '</head>',
                        to: '<script src="/client/js/app.js"></script></head>'
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