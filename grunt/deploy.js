'use strict';

module.exports = function (grunt) {
	var opt = this;

	this.alias('dev', [
		'install',
		'build',
		'deploy',
		'env/dev'
	], false);

	this.alias('prod', [
		'install',
		'deploy',
		'env/prod'
	], false);

	this.alias('test', [
		'env/test'
	], false);

	this.include([
		'install',
		'deploy',
		'client/deploy',
		'crm-client/deploy'
	]);

};