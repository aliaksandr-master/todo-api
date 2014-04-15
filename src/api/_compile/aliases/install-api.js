module.exports = [
	'jshint:api-compile',
	'clean:api-install',
	'copy:api-install',
	'replace:api-local-config',
	'copy:api-database-schema'
];