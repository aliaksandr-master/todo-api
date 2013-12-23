define(function(require, exports, module){
    "use strict";

    var Chaplin = require('chaplin');
	var BackboneLocalStorage = require('backbone/localStorage');

	var preloader = require('lib/preloader');

	var BaseCollection = Chaplin.Collection.extend({

		storagePref: null,

		preloader: preloader,

		initialize: function(){
			BaseCollection.__super__.initialize.apply(this, arguments);
		},

		fetch: function(){
			var that = this;

			this.preloader.on();
			var jqXHR = BaseCollection.__super__.fetch.apply(this, arguments);
			jqXHR.always(function(){
				that.preloader.off();
			});
			return jqXHR;
		},

		clean: function(){
			var model;
			while ( this.length ) {
				this.first().destroy();
			}
			return this;
		},

		initStorage:function(storageID){
			if(this.storagePref){
				this.localStorage = new BackboneLocalStorage(this.storagePref + (storageID || ""));
			}
		}

	});

    return BaseCollection;
});