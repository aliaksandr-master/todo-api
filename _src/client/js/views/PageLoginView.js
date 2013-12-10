define('PageLoginView',function(require, exports, module){
    "use strict";
    
    var App = require('App');
    var $ = require('jquery');
    var bb = require('Backbone');

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