define(function(require, exports, module){
    "use strict";

    var $ = require('jquery');
    require('bootstrap');

    return function () {

		$('.panel-collapse').collapse();
		console.log(1);
	};
});