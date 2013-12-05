define('HomeView',function(require, exports, module){
    "use strict";
    
    var App = require('App');
	var bb = require("Backbone");
    
    return bb.View.extend({

		template: window.JST['_src/client/templates/HomePageTemplate.hbs'],

		initialize:function(){
			//alert('HomeView');

			this.$el.append(this.template());
		}

	});
    
});