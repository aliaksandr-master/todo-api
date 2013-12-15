define('HomeView',function(require, exports, module){
    "use strict";
    
    var App = require('App');
	var bb = require("backbone");
    
    return bb.View.extend({

		template: window.JST['_src/client/templates/PageHome.hbs'],

		initialize:function(){
			//alert('HomeView');

			this.$el.append(this.template());
		}

	});
    
});