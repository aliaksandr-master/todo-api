define(function(require, exports, module){
    "use strict";

	var _ = require('underscore');
	var Handlebars = require('handlebars');
	var Chaplin = require('chaplin');
	var preloader = require('lib/preloader');
	var sessionUser = require('lib/session');
	var lang = require('lib/lang');

	require('lib/view-helper');

	var BaseView = Chaplin.View.extend({

		preloader: preloader,

		noWrap: true,
		autoRender: true,
		autoAttach: true,

		attach: function(){
			var r = BaseView.__super__.attach.apply(this, arguments);

			if(this.model && this.bindings){
				this.unstickit();
				this.stickit();
			}
			return r;
		},

		render: function () {
			_.each(this.subviews, function (subview) {
				if (subview.el && subview.el.parentNode) {
					subview.el.parentNode.removeChild(subview.el);
				}
			});
			BaseView.__super__.render.apply(this, arguments);
			_.each(this.subviews, function (subview) {
				subview.render();
			});
		},

		formSubmit: function(opt){
			this.$el.smartForm(opt, this);
		},

		template: function(){},

		getTemplateData: function () {
			var data = BaseView.__super__.getTemplateData.apply(this, arguments);
			data._user = (sessionUser.model() || {}).attributes;
			data._lang = lang;
			return data;
		},

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
