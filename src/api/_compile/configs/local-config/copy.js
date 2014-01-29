"use strict";
module.exports = function(grunt){

	return {

		'api-local-config': {

			options: {
				excludeEmpty: true
			},

			files: [
				{
					src: "src/api/config/database.php",
					dest: "build/api/config/database.php"
				}
			]
		}
	};
};