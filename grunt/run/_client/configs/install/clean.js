"use strict";
module.exports = function(grunt){

	return {

		'client-vendor': [
			this.BUILD + '/client/static/vendor'
		],

		client: [
			this.BUILD + '/client'
		]

	};
};