module.exports = [
	'install',
	'build',
	'clean:client-deploy',
	'cssmin:client-compress-all',
	'copy:client-build-to-deploy',
	'requirejs:client-compile',
	'copy:client-deploy-to-build',
];