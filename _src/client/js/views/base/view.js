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
				var $form = $(this);
				var method = ($form.attr('method') || 'post').toUpperCase();
				var action = $form.attr('action');

				if(!action){
					throw new Error('undefined action for ajax form submit');
				}

				var vals = {};

				var data = $(this).serializeArray();

				_.each(data, function(v){
					vals[v.name] = v.value;
				});

				$.ajax({
					type: method,
					url: action,
					dataType: "json",
					data: $.param([{
						name: 'json',
						value: JSON.stringify(opt.pipe(vals))
					}]),
					success: function(resp){
						$form.hideErrorAll();
						opt.onSuccess(resp.data);
					},
					error: function(jqXHR){
						$form.hideErrorAll();
						if(jqXHR.responseJSON && jqXHR.responseJSON.error){
							_.each(jqXHR.responseJSON.error.input, function(error, fieldName){
								_.each(error, function(params, ruleName){
									$('[name="' + fieldName + '"]', $form).showError(fieldName, vals[fieldName], ruleName, params);
								});
							});
						}
						opt.onError();
					}
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
