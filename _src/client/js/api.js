define(function(require, exports, module){
    "use strict";

	exports = {
		"#login": {
			url: "user/login",
			method: "post",
			client2server: function(model){
				return model.toJSON();
			},
			server2client: function(model, response){
				return response;
			}
		},
		"#register": {
			url: "user/register",
			method: "post",
			client2server: function(model){
				return model.toJSON();
			},
			server2client: function(model, response){
				return response;
			}
		}
	};

    return exports;
});