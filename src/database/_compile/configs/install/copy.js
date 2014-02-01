"use strict";
module.exports = function(grunt){

	return {

		'db': {

			files: [
				{
					expand: true,
					cwd: this.SRC + "/database",
					src: [
						'index.php',
						'.htaccess',
						'application/*',
						'application/**/*'
					],
					dest: this.BUILD + "/db"
				}
			]
		}
	};
};