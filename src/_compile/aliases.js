module.exports = {
	"build": [
		"copy:build-env",
		"build-opt",
		"build-api",
		"build-api-test",
		"build-client"
	],
	"default": [
		"install",
		"build"
	],
	"deploy-dev": [
		"install",
		"build",
		"copy:env-dev"
	],
	"deploy-prod": [
		"install",
		"build",
		"copy:env-prod"
	],
	"deploy-test": [
		"install",
		"build",
		"copy:env-test"
	],
	"empty": [],
	"install": [
		"clean:installed",
		"install-opt",
		"install-database",
		"install-api",
		"install-api-test",
		"install-client"
	],
	"test-deploy": [
		"install",
		"build",
		"clean:client-deploy",
		"cssmin:client-compress-all",
		"copy:client-build-to-deploy",
		"requirejs:client-compile",
		"copy:client-deploy-to-build"
	]
};