define('PageLoginView',function(require, exports, module){
    "use strict";
    
    var App = require('App');
    var bb = require('Backbone');

    return bb.View.extend({
		template: window.JST['_src/client/templates/PageLogin.hbs'],

		initialize: function(){
			this.$el.append(this.template());

			this.$('form').submit(function(){
				return false;
			});

			this.$('.login-submit').on('click',function(){

				return false;
			});

		}
	});
    
});