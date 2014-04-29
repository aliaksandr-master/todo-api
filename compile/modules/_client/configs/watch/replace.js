"use strict";
module.exports = function(grunt, options){

	return {

		'client-livereload': {
			overwrite: true,
			src: this.BUILD + '/client/static/index.html',
			replacements: [
				{
					from: '</head>',
					to: '<script async src="'+options.liveReload.src+'"></script></head>'
				}
			]
		}

	};

};