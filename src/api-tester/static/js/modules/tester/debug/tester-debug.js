define(function(require){
	'use strict';

	var $ = require('jquery');
	var _ = require('lodash');
	var BaseComponent = require('modules/tester/base/tester-component');

	var TesterDebugComponent =  BaseComponent.extend('TesterDebugComponent', {

		init: function () {

		},

		show: function (responseJSON) {
			var debug = responseJSON.debug;
			if (this.tester.modules.options.get().debugInfo) {
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
			this.showDump(debug);
		},

		clear: function () {
			this.$('#api-tester-debug-info-timers .panel-body').html('');
			this.$('#api-tester-debug-info-memory .panel-body').html('');
			this.$('#api-tester-debug-info-info-db .panel-body').html('');
			this.$('#api-tester-debug-info-headers .panel-body').html('');
			this.$('#api-tester-debug-info-info-log .panel-body').html('');
			this.$('#api-tester-debug-dump .panel-body').html('');
		},

		flipObj: function (obj) {
			var res = {};
			_.each(obj, function (v, k) {
				res[v] = k;
			});
			return res;
		},

		showTimers: function (responseDebug) {
			var timers = this.infoFormat('time', responseDebug.timers, 5);
			timers = this.flipObj(timers);
			this.$('#api-tester-debug-info-timers .panel-body').html(this.tester.modules.json.format(timers));
		},

		infoFormat: function (format, values, prec) {
			var info = {};
			_.each(values, function (v, k) {
				info[k] = this[format + 'Format'](v, prec);
			}, this);
			return info;
		},

		bytesFormat: function (number, prec) {
			var unim = ["b","kb","mb","gb","tb","pb"];
			var c = 0;
			while (number >= 1024) {
				c++;
				number = number / 1024;
			}
			return this.numberFormat(number, prec) + '' + unim[c];
		},

		numberFormat: function (number, prec) {
			prec || (prec = 4);
			var factor = Math.pow(10, prec);
			return (Math.round(number * factor) / factor).toFixed(prec);
		},

		timeFormat: function (number, prec) {
			return this.numberFormat(number, prec) + 's';
		},

		showMemory: function (responseDebug) {
			var memoryInfo = this.infoFormat('bytes', responseDebug.memory, 5);
			memoryInfo = this.flipObj(memoryInfo);
			this.$('#api-tester-debug-info-memory .panel-body').html(this.tester.modules.json.format(memoryInfo));
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
		},

		showDump: function (responseDebug) {
			var val = responseDebug.dump;
			if (!val || !val.length) {
				return;
			}
			this.$('#api-tester-debug-dump .panel-body').html(this.tester.modules.json.format(val));
		}
	});
	
	return TesterDebugComponent;
});