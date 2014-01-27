'use strict';
module.exports = function(grunt){

	return {

		typicalMin: {
			options: {
//				removeEmptyAttributes: true,
//				useShortDoctype: true,
//				collapseBooleanAttributes: true,
//				removeComments: true,
//				removeCommentsFromCDATA: true,
//				collapseWhitespace: false
			},
			files: {
				'client/index.html': 'client/index.html'
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