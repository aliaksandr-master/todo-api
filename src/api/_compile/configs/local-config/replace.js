'use strict';

module.exports = function (grunt, opt){

	return {
		'api-local-config': {
			overwrite: true,
			src: global.BUILD+'/api/config/database.php',
			replacements: [
				{
					from: '/*{{DB CONFIG PLACE HERE}}*/',
					to: function(){
						var json2php = require(global.SRC + "/_compile/utils.js").json2phpArray;
						var json = grunt.file.readJSON(global.LOCAL + "/database.json");
						return "$db=" + json2php(json) + ";";
					}
				}
			]
		}
	};
};