module.exports = [
	'jshint:api-specs',
	'clean:api-realization',
	'copy:api-realization',
	'api-specs-compiler',
	'find-php-classes:api-realization',
	'copy:api-classes-realization'
];