define(function(require, exports, module){
	'use strict';

	var BaseView = require('views/base/view'),
		template = require('templates/modules/user/profile');
	require('css!styles/modules/user/profile');

	var UserProfilePageView = BaseView.extend({

		template: template,

		autoRender: true,

		events: {
			'change .user-profile-lang-select': 'changeLang'
		},

		initialize: function(){
			var that = this;
			BaseView.prototype.initialize.apply(this,arguments);
			this.formSubmit({
				success: function(data){
					that.trigger('registered', data);
				}
			});
		},

		getTemplateData: function () {
			var data = UserProfilePageView.__super__.getTemplateData.apply(this, arguments);
			data.langIsEn = data._lang.lang === "en";
			data.langIsRu = data._lang.lang === "ru";
			return data;
		},

		changeLang: function (e) {
			var lang = this.$(e.currentTarget).val();
			location.href = '/' + lang + '/';
		}
	});

	template = null;

	return UserProfilePageView;
});
