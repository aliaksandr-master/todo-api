define(function(require, exports, module){
    "use strict";

	require('css!styles/layouts/simple');
	var $ = require('jquery');

	var template = require('templates/layouts/simple');
	var BaseView = require('views/base/view');

    var LayoutView = BaseView.extend({
		events: {
			'click .main-header-menu': 'menuClick',
			'click .main-menu-li-a': 'closeMenu'
		},
		container: 'body',
		regions:{
			main: '.main-content'
		},
		template: template,

		initialize: function(){
			BaseView.prototype.initialize.apply(this, arguments);
		},

		menuClick: function(e){
			var that = this;
			var $menu = this.$('.main-menu');
			$menu.addClass('-open');
			$(document).on('click.menuClickCLose',function(e){
				var $this = $(e.target);
				if(!$this.is($menu) && !$this.hasClass('.main-header-menu') && !$this.closest('.main-header-menu').length && !$this.closest($menu).length){
					that.closeMenu();
					$(document).off('.menuClickCLose');
				}
				return false;
			});

		},

		closeMenu: function(){
			this.$('.main-menu').removeClass('-open');
		}

	});

	template = null;
    return LayoutView;
});