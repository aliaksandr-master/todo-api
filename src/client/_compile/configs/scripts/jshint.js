"use strict";
module.exports = function(grunt){

	return {
		client: {
			src: [
				this.SRC + '/client/_compile/**/*.{js,json}',
				this.SRC + '/client/static/js/**/*.js',
				this.SRC + '/client/static/js/*.js',
				this.SRC + '/client/static/*.js'
			]
		}

	};
};