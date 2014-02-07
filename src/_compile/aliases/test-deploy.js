module.exports = [
	'install',
	'build',
	'clean:client-deploy',
	'cssmin:client-compress-all',
	'copy:client-build-to-deploy',
	'requirejs:client-compile',
	'clean:client-build',
	'copy:client-deploy-to-build',
];