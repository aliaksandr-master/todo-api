define(function(require, exports, module){
    "use strict";

	var Handlebars = require('handlebars');
	var Chaplin = require('chaplin');
	var $ = require('jquery');
	var _ = require('underscore');
	var preloader = require('lib/preloader');

	require('lib/view-helper');

	var BaseView = Chaplin.View.extend({

		preloader: preloader,

		noWrap: true,

		dispose: function(){
			var r = BaseView.__super__.dispose.apply(this, arguments);
			return r;
		},

		remove: function(){
			var r = BaseView.__super__.remove.apply(this, arguments);
			return r;
		},

		attach: function(){
			var r = BaseView.__super__.attach.apply(this, arguments);

			if(this.model && this.bindings){
				this.unstickit();
				this.stickit();
			}
			return r;
		},

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
