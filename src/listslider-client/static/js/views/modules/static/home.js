define(function(require, exports, module){
    'use strict';

    var BaseView = require('views/base/view');
    var template = require('templates/modules/static/home');

	require('css!styles/modules/static/home');


	var HomePageView = BaseView.extend({

		autoRender: true,
		template: template

	});

    return HomePageView;
});