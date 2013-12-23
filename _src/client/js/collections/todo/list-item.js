define(function(require){
    "use strict";

	var LocalStorageCollection = require('collections/base/collection');
	var ItemModel = require('models/todo/list-item');

    var ListItemCollection = LocalStorageCollection.extend({

		storagePref: "todo-list-items-",

        model: ItemModel,

        comparator: function (model) {
            return model.get("sort_order");
        },

        initialize: function (listId) {
			ListItemCollection.__super__.initialize.apply(this);
            this.initStorage(listId);
        }

    });

	return ListItemCollection;

});