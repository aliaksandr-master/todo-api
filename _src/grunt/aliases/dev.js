module.exports = [
	'jshint:check_src',
	'jshint:gruntfile',
	'copy:dev',
	'coffee:compile2temp',
	'typescript:compile2temp',
	'replace:dev_index',
	'replace:favicon',
	'handlebars:compile',
	'concat:dev',
	'cssmin:dev',
	'replace:fonts_in_css',
	'clean:templates',
	'replace:srcVersion'
];