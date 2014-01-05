define(function(require, exports, module){
    "use strict";

    var Chaplin = require('chaplin');
    var _ = require('underscore');
	var mainServer = require('lib/servers/main');

	var BaseModel = Chaplin.Model.extend({

		initialize: function(){
			BaseModel.__super__.initialize.apply(this, arguments);
		},

		server: mainServer,
		syncName: null,

		parse: function (response) {
			if (this.syncName && this.server && this.server.adaptor[this.syncName] && this.server.adaptor[this.syncName].server2client) {
				return this.server.adaptor[this.syncName].server2client(response);
			} else {
				return BaseModel.__super__.parse.apply(this, arguments);
			}
		},

		toJSON: function () {
			if (this.syncName && this.server && this.server.adaptor[this.syncName] && this.server.adaptor[this.syncName].client2server) {
				return this.server.adaptor[this.syncName].client2server(this);
			} else {
				return BaseModel.__super__.toJSON.apply(this, arguments);
			}
		}

	});

    return BaseModel;
});