'use strict';

module.exports = function (grunt) {
	var _ = require('underscore');
	require('load-grunt-tasks')(grunt);

	var utils = require('src/_compile/utils.js');

	var config = {},
		options = require('src/_compile/options.js')(grunt);

	utils.register(grunt, 'src', 'tasks', grunt.registerTask, options);
	utils.register(grunt, 'src', 'aliases', grunt.registerTask, options);
	utils.register(grunt, 'src', 'multitasks', grunt.registerMultiTask, options);
	utils.register(grunt, 'src', 'configs', function (name, task) {
		var taskObject = {};
		taskObject[name] = task;
		config = _.deepExtend(config, taskObject);
	}, options);

	grunt.initConfig(config);
};