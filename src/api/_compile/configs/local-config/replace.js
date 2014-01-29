'use strict';

module.exports = function (grunt, opt){

	return {
		'api-local-config': {
			overwrite: true,
			src: 'build/api/config/database.php',
			replacements: [
				{
					from: "/*{{PLACE HERE}}*/",
					to: function(){
						var json2php = require(opt.SRC + "/_compile/utils.js").json2phpArray;
						var json = grunt.file.readJSON(opt.LOCAL + "/_local/db.json");
						var php_array = json2php(json);
						return "$db=" + php_array + ";";
					}
				}
			]
		}
	}
};