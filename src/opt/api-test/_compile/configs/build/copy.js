"use strict";

module.exports = function(grunt, options){

	//

	return {
		'api-test': {
			options: {
				excludeEmpty: true
			},
			files: [
				{
					expand: true,
					cwd: global.SRC + '/opt/api-test',
					src: [
						'!_compile/*',
						'!_compile/**/*',
						'**/*.{php,html,htaccess,hbs,js,css,eot,svg,ttf,woff,otf}',
						'**/.htaccess'
					],
					dest: global.BUILD + '/api-test'
				}
			]
		}
	};

};