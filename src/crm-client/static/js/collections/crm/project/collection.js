define(function(require){
	'use strict';

	var _ = require('underscore');
	var BaseCollection = require('collections/base/collection');
	var CrmProjectModel = require('models/crm/project/model');

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