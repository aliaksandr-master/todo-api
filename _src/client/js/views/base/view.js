define(function(require, exports, module){
    "use strict";

	var Handlebars = require('handlebars');
	var Chaplin = require('chaplin');
	var $ = require('jquery');
	var _ = require('underscore');
	var preloader = require('lib/preloader');

	require('lib/view-helper');
	var bind = require('lib/data-bind');

	var BaseView = Chaplin.View.extend({

		preloader: preloader,

		noWrap: true,

		initialize: function(){
			BaseView.__super__.initialize.apply(this, arguments);
		},

		attach: function(){
			var r = BaseView.__super__.attach.apply(this, arguments);
			this.unbindAll();
			this.bind();
			return r;
		},

		remove: function(){
			this.unbindAll();
			return BaseView.__super__.remove.apply(this, arguments);
		},

		bind: bind.viewDataBind,
		unbind: bind.viewDataUnBind,
		unbindAll: bind.viewDataUnBindAll,

		formSubmit: function(opt){

			opt = $.extend({
				onSuccess: function(){},
				onError: function(){},
				pipe: function(a){
					return a;
				}
			},opt);

			this.$el.on('submit','form',function(){
				var $t = $(this);
				var method = ($t.attr('method')||'post').toLowerCase();
				var action = $t.attr('action');

				if(!action){
					throw new Error('undefined action for ajax form submit');
				}

				$.ajax({
					type: method,
					url: action,
					dataType: "JSON",
					data: opt.pipe($(this).serializeArray()),
					success: opt.onSuccess,
					error: opt.onError
				});

				return false;
			});
		},

		template: function(){},

		getTemplateFunction: function(){
			var template, templateFunc;
			template = this.template;
			if (typeof template === 'string') {
				templateFunc = Handlebars.compile(template);
				BaseView.prototype.template = templateFunc;
			} else {
				templateFunc = template;
			}
			return templateFunc;
		}

	});


    return BaseView;
});
