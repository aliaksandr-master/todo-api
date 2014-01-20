"use strict";
module.exports = function(grunt){

	return {

		all: [
			'client/',
			'build/',
			'build_production/',
			'build_testing/',
			'build_development/'
		],

		build: [
			'build/'
		],

		client: [
			'client'
		],

		serverApi: [
			'server/api/'
		],

		cleanPhp: [
			'server/_generated_/class-map.json'
		],

		scripts: [
			'client/js'
		],

		pictures: [
			'client/images'
		],

		styles: [
			'client/styles'
		],

		fonts: [
			'client/css'
		],

		templates: [
			'client/templates'
		]

	};
};