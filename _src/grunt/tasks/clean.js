module.exports = function(grunt){

	return {
		dev: [
			'client/',
			'temp/'
		],
		watched_css_js: [
			'client/js',
			'client/css'
		],
		templates: [
			'client/templates'
		]
	};
};