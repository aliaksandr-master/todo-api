'use strict';

module.exports = function (grunt, opt){

	return {
		'db-local-config': {
			overwrite: true,
			src: global.BUILD + "/db/application/config/database.php",
			replacements: [
				{
					from: '/*{{PLACE HERE}}*/',
					to: function(){
						var json2php = require(global.SRC + "/_compile/utils.js").json2phpArray;
						var json = grunt.file.readJSON(global.LOCAL + "/database.json");
						var php_array = json2php(json);
						return "$db=" + php_array + ";";
					}
				}
			]
		}
	};
};