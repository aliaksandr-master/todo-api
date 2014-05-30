define(function(require){
	"use strict";

	var $ = require('jquery');
	var _ = require('lodash');
	var BaseComponent = require('modules/tester/base/tester-component');

	var TesterDebugComponent =  BaseComponent.extend('TesterDebugComponent', {

		init: function () {

		},

		show: function (responseJSON) {
			var debug = responseJSON.debug;
			if (this.tester.getOptions().debugInfo) {
				delete responseJSON.debug;
			}
			if (_.isEmpty(debug)) {
				return;
			}
			this.showTimers(debug);
			this.showMemory(debug);
			this.showDb(debug);
			this.showHeaders(debug);
			this.showStackTrace(debug);
		},

		clear: function () {
			this.$('#api-tester-debug-info-timers .panel-body').html('');
			this.$('#api-tester-debug-info-memory .panel-body').html('');
			this.$('#api-tester-debug-info-info-db .panel-body').html('');
			this.$('#api-tester-debug-info-headers .panel-body').html('');
			this.$('#api-tester-debug-info-info-log .panel-body').html('');
		},

		showTimers: function (responseDebug) {
			this.$('#api-tester-debug-info-timers .panel-body').html(this.tester.modules.json.format(responseDebug.timers));
		},

		showMemory: function (responseDebug) {
			this.$('#api-tester-debug-info-memory .panel-body').html(this.tester.modules.json.format(responseDebug.memory));
		},

		showDb: function (responseDebug) {
			this.$('#api-tester-debug-info-db .panel-body').html(this.tester.modules.json.format(responseDebug.db));
		},

		showHeaders: function (responseDebug) {
			if (!responseDebug.input || !responseDebug.input.headers) {
				return;
			}
			this.$('#api-tester-debug-info-headers .panel-body').html(this.tester.modules.json.format(responseDebug.input.headers.raw));
		},

		showStackTrace: function (responseDebug) {
			if (!responseDebug.stackTrace || !responseDebug.stackTrace.length) {
				return;
			}
			this.$('#api-tester-debug-info-log .panel-body').html(this.tester.modules.json.format(responseDebug.stackTrace));
		}
	});
	
	return TesterDebugComponent;
});