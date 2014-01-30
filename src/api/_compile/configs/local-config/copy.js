"use strict";
module.exports = function(grunt){

	return {

		'api-local-config': {

			options: {
				excludeEmpty: true
			},

			files: [
				{
					src: global.SRC    + "/api/config-source/database.php",
					dest: global.BUILD + "/api/config/database.php"
				}
			]
		}
	};
};