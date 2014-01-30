'use strict';
var W = global;
module.exports = function (grunt) {

	var _ = require('underscore');
	require('load-grunt-tasks')(grunt);

	var utils = require('./src/_compile/utils.js');

	var config = {},
		options = require('./src/_compile/options.js')(grunt);

	options.ROOT = W.ROOT = __dirname;
	options.DS = W.DS = '/';
	options.SD = W.SD = '\\';
	options.SRC = W.SRC = W.ROOT + '/src';
	options.BUILD = W.BUILD = W.ROOT + '/build';
	options.DEPLOY = W.DEPLOY = W.ROOT + '/deploy';
	options.LOCAL = W.LOCAL = W.ROOT + '/_local';

	utils.register(grunt, 'tasks', grunt.registerTask, options);
	utils.register(grunt, 'aliases', grunt.registerTask, options);
	utils.register(grunt, 'multitasks', grunt.registerMultiTask, options);
	utils.register(grunt, 'configs', function (name, task) {
		var taskObject = {};
		taskObject[name] = task;
		config = _.deepExtend(config, taskObject);
	}, options);

	grunt.initConfig(config);
};