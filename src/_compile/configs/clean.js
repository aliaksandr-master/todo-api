"use strict";
module.exports = function(grunt){

	return {

		temp: [
			'build/_temp'
		],

		build: [
			'build/_temp',
			'build/client',
			'build/opt'
		],

		client: [
			'build/client'
		],

		serverApi: [
			'api/var/api.source.json',
			'api/var/api.parsed.json'
		],

		cleanPhp: [
			'api/var/class-map.json'
		],

		scripts: [
			'build/client/js'
		],

		pictures: [
			'build/client/images'
		],

		styles: [
			'build/client/styles'
		],

		fonts: [
			'build/client/css'
		],

		templates: [
			'build/client/templates'
		]

	};
};