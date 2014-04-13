module.exports = [
	'jshint:api',
	'clean:api-scripts',
	'copy:api-scripts',
	'mkdir:api-var',
	'copy:api-local-config',
	'copy-new-files:api-local-config',
	'replace:api-local-config',
	'api-compiler',
	'api-php-classes-register',
	'api-db-schema'
];