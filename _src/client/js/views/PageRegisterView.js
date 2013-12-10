define('PageRegisterView',function(require, exports, module){
	"use strict";

	var App = require('App');
	var $ = require('jquery');
	var bb = require('Backbone');

	return bb.View.extend({

		template: window.JST['_src/client/templates/PageRegister.hbs'],

		initialize: function(){
			var that = this;
			this.$el.append(this.template());

			this.$('form').submit(function(){
				return false;
			});

			this.$('.register-submit').on('click',function(){


				$.ajax({
					type: "POST",
//					dataType: 'json',
					url: '/server/user/register',
					data: {
						username: that.$('[name="username"]').val(),
						email: that.$('[name="email"]').val(),
						confirm_password: that.$('[name="confirm_password"]').val(),
						password: that.$('[name="password"]').val()
					},
					success:function(response){
						that.$('.alert-success').html(response);
						$.jGrowl('ajax success');
					}
				});

				return false;
			});

		}
	});

});