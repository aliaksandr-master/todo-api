define(function(require, exports, module){
	'use strict';

	var $ = require('jquery');

	var template = require('templates/layout');
	var BaseView = require('views/base/view');
	var MainMenuCollection = require('models/elements/menu/main/collection');
	var MainMenuView = require('views/elements/menu/main/menu');

	require('css!styles/index');
	require('css!styles/layout');

	var ifLoggedCollection = [
		{
			name: 'crm-projects',
			href: null,
			text: 'Project List'
		}
	];

	var ifGuestCollection = [
	];

	var LayoutView = BaseView.extend({

		container: 'body',

		regions:{
			'layout': '.main',
			'layout/navbar': '.main-navbar',
			'layout/content': '.main-content',
			'layout/footer': '.main-footer'
		},

		template: template,

		render: function () {
			LayoutView.__super__.render.apply(this, arguments);

			var data = ifGuestCollection;
			if (this.session.logged()) {
				data = ifLoggedCollection;
			}

			this._menuCollection = new MainMenuCollection(data);
			this._mainMenu = new MainMenuView({
				collection: this._menuCollection,
				region: 'layout/navbar'
			});

			this.subview('menu', this._mainMenu);
		}

	});

	template = null;
	return LayoutView;
});