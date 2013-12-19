define(function(require, exports, module){
    "use strict";

	require('css!styles/layouts/simple');
	var $ = require('jquery');

	var template = require('templates/layouts/simple');
	var BaseView = require('views/base/view');

    var LayoutView = BaseView.extend({

		className: 'main-wr',

		events: {
			'click .main-menu-head-btn': 'menuClick',
			'click .main-menu-li-a': 'closeMenu'
		},

		container: 'body',

		regions:{
			main: '.main-content'
		},

		template: template,

		initialize: function(){
			LayoutView.__super__.initialize.apply(this, arguments);
		},

		attach: function(){
			var res = LayoutView.__super__.attach.apply(this, arguments);
			$('.pre-loader').appendTo(".main-header-user-wr");
			return res;
		},

		menuClick: function(e){
			var that = this;
			var $menu = this.$('.main-menu');
			if(!$menu.hasClass('-open')){
				$menu.addClass('-open');
				$(document).on('click.menuClickCLose',function(e){
					var $this = $(e.target);
					if(!$this.is($menu) && !$this.hasClass('.main-header-menu') && !$this.closest('.main-header-menu').length && !$this.closest($menu).length){
						that.closeMenu();
						$(document).off('.menuClickCLose');
					}
					return false;
				});
			}else{
				that.closeMenu();
				$(document).off('.menuClickCLose');
			}
		},

		closeMenu: function(){
			this.$('.main-menu').removeClass('-open');
		}

	});

	template = null;
    return LayoutView;
});