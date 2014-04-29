"use strict";
module.exports = function(grunt){

	return {

		'client-html': {
			files: [
				{
					expand: true,
					cwd: this.SRC + "/client/static/",
					src: [
						'**/*.{html,htm,xhtml}',
						'*.{html,htm,xhtml}',
					],
					dest: this.BUILD + "/client/static/",
					ext: '.html'
				}
			]
		}

	};

};