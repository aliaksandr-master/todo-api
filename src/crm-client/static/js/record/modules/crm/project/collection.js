define(function(require){
	'use strict';

	var _ = require('underscore');
	var BaseCollection = require('record/base/collection');
	var CrmProjectModel = require('record/crm/project/model');

	var ListItemCollection = BaseCollection.extend({

		initialize: function(){
			ListItemCollection.__super__.initialize.apply(this, arguments);
		},

		url: function(){
			return '/crm/project/';
		},

		model: CrmProjectModel,

		comparator: function (model) {
			return model.get('sortOrder');
		}

	});

	return ListItemCollection;

});