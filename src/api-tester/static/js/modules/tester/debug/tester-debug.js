define(function(require){
	'use strict';

	var $ = require('jquery');
	var _ = require('lodash');
	var BaseComponent = require('modules/tester/base/tester-component');

	var TesterDebugComponent =  BaseComponent.extend('TesterDebugComponent', {

		init: function () {

		},

		show: function (responseJSON, requestObj) {
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
			this.showGraph(debug, requestObj);
		},

		clear: function () {
			this.$('#api-tester-debug-info-timers .panel-body').html('');
			this.$('#api-tester-debug-info-memory .panel-body').html('');
			this.$('#api-tester-debug-info-info-db .panel-body').html('');
			this.$('#api-tester-debug-info-headers .panel-body').html('');
			this.$('#api-tester-debug-log .panel-body').html('');
			this.$('#api-tester-debug-dump .panel-body').html('');
			this.$('#api-tester-debug-graph .panel-body').html('');
		},

		flipObj: function (obj) {
			var res = {};
			_.each(obj, function (v, k) {
				res[v] = k;
			});
			return res;
		},

		showTimers: function (responseDebug) {
			var timers = {};
			_.each(responseDebug.timers, function (timer, name) {
				timers[name] = timer.stop[0] - timer.start[0];
			});
			timers = this.infoFormat('time', timers, 5);
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

		showGraph: function (responseDebug, requestObj) {
			var str = '';
			var first = null;
			var last = null;
			var objs = [];

			_.each(responseDebug.timers, function (timer, name) {
				var obj = {
					start: timer.start,
					stop: timer.stop,
					name: name
				};
				obj.firstTime = obj.start[0];
				obj.lastTime = obj.stop[obj.stop.length-1];
				obj.duration = obj.lastTime - obj.firstTime;
				objs.push(obj);
				if (first == null) {
					first = obj;
					last = obj;
					return;
				}
				if (first.firstTime > obj.firstTime) {
					first = obj;
				}
				if (last.lastTime < obj.lastTime) {
					last = obj;
				}
			});
			var total = last.lastTime - first.firstTime;
			_.each(objs, function (obj) {
				var percent = obj.duration * 100 / total;
				var offset = (obj.firstTime - first.firstTime) * 100 / total;
				if (first === obj) {
					offset = 0;
					if (last === obj) {
						percent = 100;
					}
				}
				obj.percent = percent;
				obj.offsetPercent = offset;
			});

			objs.sort(function (a, b) {
				if (a.firstTime < b.firstTime) {
					return -1;
				}
				if (a.firstTime === b.firstTime) {
					return 0;
				}
				return 1;
			});

			str += '<em class="api-tester-debug-time-graph-ruler" data-time="0" data-percent="0"></em>';
			str += '<em class="api-tester-debug-time-graph-ruler" data-time="0" data-percent="25"></em>';
			str += '<em class="api-tester-debug-time-graph-ruler" data-time="0" data-percent="50"></em>';
			str += '<em class="api-tester-debug-time-graph-ruler" data-time="0" data-percent="75"></em>';
			str += '<em class="api-tester-debug-time-graph-ruler" data-time="0" data-percent="100"></em>';

			_.each(objs, function (obj, k) {
				str =  str + '<div data-number="' + (k + 1) + '" title="' + obj.name + '" class="api-tester-debug-time-graph-li" style="width: ' + obj.percent + '%; margin-left: ' + obj.offsetPercent + '%; margin-top: ' + k + 'em;"></div>';
			});
			str = '<div class="api-tester-debug-time-graph-l">' + str + '</div>';

			var dbCounter = 0;
			_.each(responseDebug.logs, function (log, k) {
				var offset = (log.time - first.firstTime) * 100 / total;
				if (/dbQuery/.test(log.name)) {
					var percent = responseDebug.db[dbCounter].time * 100 / total;
					str += '<b style="margin-top: ' + k +'em; width: ' + percent +'%;margin-left: ' + offset + '%" title="' + log.name + '" class="api-tester-debug-time-graph-log -db-query"></b>';
					dbCounter++;
					return;
				}
				str += '<b style="margin-top: ' + k +'em; margin-left: ' + offset + '%" title="' + log.name + '" class="api-tester-debug-time-graph-log"></b>';
			});
			str += '<h1 class="api-tester-debug-time-graph-h">Server time: ' + this.timeFormat(total, 5) + '</h1>';
			str = '<div class="api-tester-debug-time-graph-in">' + str + '</div>';

			str = '<div style="width: ' + (total * 100 / requestObj.requestTime) + '%;" class="api-tester-debug-time-graph-in">' + str + '</div>';
			str += '<div title="Request time: ' + requestObj.requestTime + 's" class="api-tester-debug-time-graph-req-time"></div>';
			str = '<div class="api-tester-debug-time-graph">' + str + '</div>';
			this.$('#api-tester-debug-graph .panel-body').html(str);
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
			if (_.isEmpty(responseDebug.logs)) {
				return;
			}
			var logs = _.map(responseDebug.logs, function (v, k) {
				if (_.isEmpty(v.args)) {
					return v.name;
				}
				var obj = {};
				obj[v.name] = v.args;
				return obj;
			});
			this.$('#api-tester-debug-log .panel-body').html(this.tester.modules.json.format(logs));
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