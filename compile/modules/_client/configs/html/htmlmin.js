"use strict";
module.exports = function(grunt){

	return {

		'client-html-min': {
			options: {
//				removeEmptyAttributes: true,
//				useShortDoctype: true,
//				collapseBooleanAttributes: true,
//				removeComments: true,
//				removeCommentsFromCDATA: true,
//				collapseWhitespace: false
			},
			files: {
				src: this.BUILD + '/client/static/index.html',
				dest: this.BUILD + '/client/static/index.html'
			}
		},

		hardMin: {
			options: {
				removeEmptyAttributes: true,
				useShortDoctype: true,
				collapseBooleanAttributes: true,
				removeComments: true,
				removeCommentsFromCDATA: true,
				collapseWhitespace: true,

				removeRedundantAttributes: true,
				removeOptionalTags: true
			},
			files: {
				'client/index.html': 'client/index.html'
			}
		}
	};
};