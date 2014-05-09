"use strict";
module.exports = function(grunt){

	return {
		'client-styles': {
			options: {
				compress: false,
				cleancss: false,
				syncImport: true,
				dumpLineNumbers: false,
				ieCompat: true,
				sourceMap: false,
				relativeUrls: false,
//				report: 'gzip',
				strictUnits: true,
				strictImports: true,
				optimization: null,
				rootpath: '',
				paths: [
					global.SRC + '/client/static/client'
				]
			},
			files: [
				{
					expand: true,
					cwd: global.SRC + "/client/static/styles",
					src: [
						'*.less',
						'**/*.less'
					],
					dest: global.BUILD + '/client/static/styles',
					ext: '.css'
				}
			]
		}
	};

};