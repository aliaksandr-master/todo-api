define(function(require, exports, module){
    "use strict";

	var BaseView = require('views/base/view');
	var template = require('templates/simple-layout');

    var LayoutView = BaseView.extend({
		container: 'body',
		regions:{
			main: '.main'
		},
		template: template
	});

	template = null;
    return LayoutView;
});