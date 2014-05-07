"use strict";
module.exports = function(grunt){

	return {

		'client-styles': {
			files: [
				{
					expand: true,
					cwd: global.SRC + "/client/",
					src: [
						'**/*.css',
						'*.css'
					],
					dest: global.BUILD + "/client/"
				}
			]
		},

		'client-fonts': {
			files: [
				{
					expand: true,
					cwd: this.SRC + "/client/static/",
					src: '**/*.{ttf,svg,eot,woff}',
					dest: this.BUILD + "/client/static/fonts/",
					flatten: true
				}
			]
		}

	};

};