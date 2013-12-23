define(function(require, exports, module){
    "use strict";

    var $ = require('jquery');

    return {

		on: function(){
			console.log("on");
			$(document.body).removeClass("-preloader-inactive");
		},

		off: function(){
			console.log("off");
			$(document.body).addClass("-preloader-inactive");
		}

	};

});