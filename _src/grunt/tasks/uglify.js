module.exports = function(grunt){

	return {

		dev_compile: {
			options: {
				stripBanners: true
			},
			src:  'client/js/app.js',
			dest: 'client/js/app.js'
		},

		dev_compile_hbs: {
			expand: true,
			cwd: "client/templates",
			src: [
				'**/*.js'
			],
			dest: ''
		}
	};
};