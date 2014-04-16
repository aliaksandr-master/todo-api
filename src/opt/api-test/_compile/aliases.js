module.exports = {
	'build-api-test': [
		'clean:build-api-test',
		'copy:api-test',
		'json-merge:api-test-specs',
	],
	'deploy-api-test': [
		'clean:deploy-api-test',
		'copy:deploy-api-test'
	],
	'install-api-test': [
	]
};