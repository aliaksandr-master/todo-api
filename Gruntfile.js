'use strict';

module.exports = function (grunt) {
	require('load-grunt-tasks')(grunt);

	var _ = require('underscore'),
		utils = require('./_src/grunt/utils.js');

	var config = {},
		options = require('./_src/grunt/options.js')(grunt);

	utils.register(grunt, './_src/grunt/tasks', grunt.registerTask, options);
	utils.register(grunt, './_src/grunt/aliases', grunt.registerTask, options);
	utils.register(grunt, './_src/grunt/multitasks', grunt.registerMultiTask, options);
	utils.register(grunt, './_src/grunt/configs', function (name, task) {
		var taskObject = {};
		taskObject[name] = task;
		config = _.deepExtend(config, taskObject);
	}, options);

	console.log(config);

	grunt.initConfig(config);
};