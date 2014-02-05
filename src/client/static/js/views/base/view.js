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
			this.$el.smartForm(opt, this);
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
