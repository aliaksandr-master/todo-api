"use strict";
module.exports = function(grunt){

	return {

		'client-templates': {

			options: {
				namespace: false,
				amd: true,
				processContent: function(content){
					return content.replace(/^[\x20\t]+/mg, '').replace(/[\x20\t]+$/mg, '').replace(/[\r\n]+/g, '');
				}
			},

			files: [
				{
					expand: true,
					cwd: this.SRC + "/client/static/templates",
					src: [
						'**/*.hbs',
						'*.hbs'
					],
					dest: this.BUILD + '/client/static/templates',
					ext: '.js'
				}
			]
		}
	};
};