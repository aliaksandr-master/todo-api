define(function(require, exports, module){
    "use strict";

    var Chaplin = require('chaplin');

	var preloader = require('lib/preloader');

	var BaseCollection = Chaplin.Collection.extend({

		initialize: function(args){
			this.propModel = (args || {}).propModel || {};
			BaseCollection.__super__.initialize.call(this, args);
		},

		remote: false, // DualStorage option

		local: true,   // DualStorage option

		dispose: function(){
			this.propModel = {};
			return BaseCollection.__super__.dispose.apply(this, arguments);
		},

		clean: function(){
			while (this.length) {
				this.first().destroy.apply(arguments);
			}
			return this;
		}

	});

    return BaseCollection;
});