define(function(require, exports, module){
    'use strict';

	var $ = require('jquery');

	var template = require('templates/layouts/simple');
	var BaseView = require('views/base/view');
	var sessionUser = require('lib/session');
	require('css!styles/index');
	require('css!styles/layouts/simple');

    var LayoutView = BaseView.extend({

		container: 'body',

		regions:{
			'main': '.main',
			'main/header': '.main-header',
			'main/content': '.main-content',
			'main/footer': '.main-footer'
		},

		template: template

	});

	template = null;
    return LayoutView;
});