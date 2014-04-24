module.exports = {
	"build-api": [
		"jshint:api-specs",

		"clean:api-realization",
		"copy:api-realization",

		"find-php-classes:api-classes",
		"json2php:api-classes",

		"api-specs-compiler:api-specs",
		"split-files:api-specs",
		"split-files:api-specs-methods-config",

		"php_router_gen:api-router",
		"json2php:api-router"
	],
	
	"install-api": [
		"jshint:api-compile",
		"clean:api-install",
		"copy:api-install",
		"replace:api-local-config",
		"copy:api-database-schema"
	]
};