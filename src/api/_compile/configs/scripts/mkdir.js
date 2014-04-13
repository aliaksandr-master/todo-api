"use strict";

module.exports = function(grunt){

	return {
		'api-var': {
			options: {
				mode: '0777',
				create: [
					this.BUILD + '/api/var',
					this.BUILD + '/api/var/cache',
					this.BUILD + '/api/var/session'
				]
			}
		}
	};
};