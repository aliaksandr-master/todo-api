define(function(require, exports, module){
    "use strict";

	var api = {

		"#login": {
			client2server: function(model){
				return model.toJSON();
			},
			server2client: function(model, response){
				return response;
			}
		},

		"#register": {
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