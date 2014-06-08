define(function(require, exports, module){
    "use strict";

    var $ = require('jquery');

	var count = 1;

    return {

		on: function () {
			if (!count) {
				$(document.body).removeClass("-preloader-inactive");
			}
			count++;
		},

		off: function (forse) {
			if (forse || --count <= 0) {
				count = 0;
				$(document.body).addClass("-preloader-inactive");
			}
		}

	};

});