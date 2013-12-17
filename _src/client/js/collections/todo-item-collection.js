define(function(require){
    "use strict";

	var LocalStorageCollection = require('collections/base/local-storage-collection');
	var ItemModel = require('collections/base/todo-item');

    var TodoItemCollection = LocalStorageCollection.extend({

        model: ItemModel,

        comparator: function (model) {
            return model.get("sort_order");
        },

        initialize: function (o) {
            this.listId = (o || {}).listId || 0;
            this._initLocalStorage("item" + this.listId);
        }

    });

	return TodoItemCollection;

});