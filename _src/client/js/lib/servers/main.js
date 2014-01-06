define(function(require, exports, module){
    "use strict";

	var BaseServer = require("lib/servers/base/server");
	var _ = require("underscore");
	var $ = require("jquery");

    var MainServer = Object.create(BaseServer);

	_.extend(MainServer, {

		ajax: function (options) {
			options = _.clone(options);
			var success = options.success;
			delete options.contentType;

			var resp = {};

			var sendData = options.data;
			options.success = function(response){
				resp = response;
				var data = response.data || (options.isModel ? {} : []);
				if(success){
					success.call(this, data);
				}
				console.log(options.type, options.url, sendData ? JSON.parse(sendData) : sendData, " ===> ", data, resp.error);
			};

			if(options.type === "POST" || options.type === "PUT"){
				options.data = $.param([{
					name: "json",
					value: options.data
				}]);
			}

			return $.ajax(options);
		},

		adaptor: {


		}

	});

    return MainServer;
});