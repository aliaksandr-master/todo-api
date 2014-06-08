define(function(require){
    "use strict";

	var _ = require('underscore');
	var BaseCollection = require('record/base/collection');
	var TodoListItemModel = require('./model');

    var ListItemCollection = BaseCollection.extend({

		initialize: function(){
			ListItemCollection.__super__.initialize.apply(this, arguments);
			this.listId = this.propModel.get("listId");
		},

		url: function(){
			return "/todo/list/" + this.listId + "/item/";
		},

        model: TodoListItemModel,

        comparator: function (model) {
            return model.get("sortOrder");
        },

		create: function (model, options) {
			model = model || {};
			var sortOrders = this.map(function (mdl) {
				return mdl.get('sortOrder');
			});

			model.sortOrder = _.max(sortOrders) + 1;
			console.log(sortOrders, model.sortOrder);

			return ListItemCollection.__super__.create.call(this, model, options);
		}

    });

	return ListItemCollection;

});