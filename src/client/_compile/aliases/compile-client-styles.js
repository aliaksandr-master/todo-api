module.exports = [

	'clean:client-styles',
	'clean:client-fonts',
	'copy:client-styles',
	'less:client-styles',
//	'sass:client-styles',
	'copy:client-fonts',
	'replace:client-fonts',
	'autoprefixer:client-styles'

];