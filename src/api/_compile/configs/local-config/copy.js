"use strict";
module.exports = function(grunt){

	return {

		'api-local-config': {

			options: {
				excludeEmpty: true
			},

			files: [
				{
					src: global.SRC    + "/api/_config/database.php",
					dest: global.BUILD + "/api/config/database.php"
				}
			]
		}
	};
};