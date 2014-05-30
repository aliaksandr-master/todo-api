define(function(require){
	"use strict";

	var $  = require('jquery');
	var _  = require('lodash');
	var BBUtils  = require('lib/backbone-utils');

	var allUID = [];

	var TesterComponent = BBUtils.classCreate('TesterComponent', {

		init: BBUtils.abstractFunction('init'),

		refresh: BBUtils.abstractFunction('reset'),

		events: null,

		initEvents: function () {
			this.cid = this.className + '_' + allUID.length;
			allUID.push(this.cid);
			this.delegateEvents();
		},

		initialize: function (core) {
			this.tester = core;
			this.initEvents();
		},

		delegateEvents: function () {
			var that = this;
			_.each(this.events, function (handler, event) {
				var find = event.replace(/^([^ ]+)[ ]+(.+)$/, '$2');
				var name = event.replace(/^([^ ]+)[ ]+(.+)$/, '$1') + '.' + find.replace(/[^a-zA-Z0-9_]/g,'_');

				_.each(allUID, function (uid) {
					this.$().off(name + uid);
				}, this);

				this.$().on(name + this.uid, find, function (e) {
					if (!_.isFunction(that[handler])) {
						console.error('undefined handler "' + handler + '" in ' + that.className);
					}
					return that[handler].call(that, e, $(this));
				});
			}, this);
		},

		$: function (find) {
			return find == null ? this.tester.$el : this.tester.$el.find(find);
		}
	});

	return TesterComponent;
});