define('PageLoginView',function(require, exports, module){
    "use strict";
    
    var $ = require('jquery');
	var bb = require('backbone');
	var App = require('App');

    return bb.View.extend({
		template: window.JST['_src/client/templates/PageLogin.hbs'],

		initialize: function(){
			var that = this;
			this.$el.append(this.template());

			this.$('form').submit(function(){
				return false;
			});

			this.$('.login-submit').on('click',function(){


				$.ajax({
					type: "POST",
					url: '/server/user/login',
					data: {
						username: that.$('[name="username"]').val(),
						password: that.$('[name="password"]').val()
					}
				});

				return false;
			});

		}
	});
    
});