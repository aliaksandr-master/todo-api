module.exports = function(grunt){

	return {

		options: {
			excludeEmpty: true
		},
		dev: {
			files: [
				{
					expand: true,
					cwd: "_src/client/images/",
					src: [
						'**/*.{png,jpg,jpeg,gif,ico}',
						'*.{png,jpg,jpeg,gif,ico}'
					],
					dest: "client/images/"
				},
				{
					expand: true,
					cwd: "_src",
					src: '**/*.{ttf,svg,eot,woff}',
					dest: "client/fonts/",
					flatten: true
				},
				{
					src: '_src/client/index.html',
					dest: 'client/index.html'
				},
				{
					src: '_src/client/favicon.ico',
					dest: 'client/favicon.ico'
				}
			]
		}
	};
};