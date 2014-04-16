module.exports = [
	'jshint:api-specs',

	'clean:api-realization',
	'copy:api-realization',

	'find-php-classes:api-classes',
	'json2php:api-classes',

	'api-specs-compiler:api-specs',
	'split-files:api-specs',
	'split-files:api-specs-methods-config'
];