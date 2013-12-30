define(function(require, exports, module){
    "use strict";

    var $ = require('jquery');

    return {

		on: function(){
			$(document.body).removeClass("-preloader-inactive");
		},

		off: function(){
			$(document.body).addClass("-preloader-inactive");
		}

	};

});