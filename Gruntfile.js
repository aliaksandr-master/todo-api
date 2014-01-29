'use strict';

module.exports = function (grunt) {

	var _ = require('underscore');
	require('load-grunt-tasks')(grunt);

	var utils = require('./src/_compile/utils.js');

	var config = {},
		options = require('./src/_compile/options.js')(grunt);

	options.ROOT = global.ROOT = __dirname;
	options.DS = global.DS = '/';
	options.SD = global.SD = '\\';
	options.SRC = global.SRC = ROOT + '/src';
	options.BUILD = global.BUILD = ROOT + '/build';
	options.DEPLOY = global.DEPLOY = ROOT + '/deploy';
	options.LOCAL = global.LOCAL = ROOT + '/_local';

	utils.register(grunt, 'tasks', grunt.registerTask, options);
	utils.register(grunt, 'aliases', grunt.registerTask, options);
	utils.register(grunt, 'multitasks', grunt.registerMultiTask, options);
	utils.register(grunt, 'configs', function (name, task) {
		var taskObject = {};
		taskObject[name] = task;
		config = _.deepExtend(config, taskObject);
	}, options);

//	grunt.initConfig(config);
};