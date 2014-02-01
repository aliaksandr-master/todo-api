"use strict";
module.exports = function(grunt){

	return {

		'db-local-config': {

			options: {
				excludeEmpty: true
			},

			files: [
				{
					src: global.SRC    + "/api/_config/database.php",
					dest: global.BUILD + "/db/application/config/database.php"
				}
			]
		}
	};
};