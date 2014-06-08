define(function(require){
    'use strict';

    var _ = require('lodash');
    var Backbone = require('backbone');

    return {

		abstractFunction: function (name) {
			return function () {
				console.error('method "' + name + '" must be defined in class "' + this.className + '"');
				return null;
			};
		},

		classCreate: function (className, proto, stat) {
			proto || (proto = {});
			stat || (stat = {});

			proto.className = className;
			stat.className = className;

			function MyChild () {
				this.initialize.apply(this, arguments);
			}

			_.extend(MyChild, {
				extend: function (className, proto, stat) {
					proto || (proto = {});
					stat || (stat = {});

					proto.className = className;
					stat.className = className;

					return Backbone.Model.extend.call(this, proto, stat);
				}
			}, stat);

			_.extend(MyChild.prototype, Backbone.Events, {
				initialize: function () { }
			}, proto);

			return MyChild;
		}
    };

});