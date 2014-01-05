define(function(require, exports, module){
    "use strict";

	var BaseServer = require("lib/servers/base/server");

    var MainServer = BaseServer.extend({}, {

		adaptor: {
			"todo-list": {
				server2client: function(response){
					return response;
				},
				client2server: function(model){
					console.log(0);
					return model.attributes;
				}
			},
			"todo-list-item": {
				server2client: function(response){
					return response;
				},
				client2server: function(model){
					return model.attributes;
				}
			}
		}

	});

    return MainServer;
});