"use strict";
module.exports = function(grunt){

	return {

		compile: {

			options: {
				namespace: 'tmp',
				amd: true,
				processContent: function(content){
					return content.replace(/^[\x20\t]+/mg, '').replace(/[\x20\t]+$/mg, '').replace(/[\r\n]+/g, '');
				}
			},

			files: [
				{
					expand: true,
					cwd: "_src/client/templates",
					src: [
						'**/*.hbs',
						'*.hbs'
					],
					dest: 'client/templates',
					ext: '.js'
				}
			]
		}
	};
};