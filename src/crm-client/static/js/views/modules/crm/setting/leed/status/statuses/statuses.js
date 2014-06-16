define(function(require, exports, module){
	'use strict';

	var BaseCollectionView = require('views/base/collection');
	var template = require('templates/modules/crm/setting/leed/status/statuses/statuses');
	var SettingLeedStatusItemView = require('./status');
	require('css!styles/modules/crm/setting/leed/status/statuses/statuses');

	var SettingLeedStatusListView = BaseCollectionView.extend({

		noWrap: true,

		itemView: SettingLeedStatusItemView,

		listSelector: '.crm-setting-leed-type-list-l',

		template: template,

		events: {
			'click .crm-setting-leed-type-new-save': 'saveNewType',
			'click .crm-setting-leed-type-remove': 'removeType',
			'click .crm-setting-leed-type-save': 'saveCurrent'
		},

		getAttrFromRegion: function (region) {
			var attr = {};
			var that = this;
			this.$(region).find('.form-control').each(function () {
				var $el = that.$(this);
				attr[$el.attr('data-attribute')] = $el.val();
			});
			return attr;
		},

		getIdFromElement: function (element) {
			return this.$(element).attr('data-id');
		},

		saveNewType: function () {
			var attr = this.getAttrFromRegion('.crm-setting-leed-type-new');
			this.collection.create(attr, {wait: true});
		},

		saveCurrent: function (e) {
			var id = this.getIdFromElement(e.currentTarget);
			var attr = this.getAttrFromRegion(this.$(e.currentTarget).closest('tr'));
			this.collection.get(id).save(attr);
		},

		removeType: function (e) {
			var id = this.getIdFromElement(e.currentTarget);
			this.collection.get(id).destroy();
		}

	});

	return SettingLeedStatusListView;
});