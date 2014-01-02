define(function(require){
    "use strict";

	var BaseCollection = require('collections/base/collection');
	var TodoListItemModel = require('models/todo/list-item');

    var ListItemCollection = BaseCollection.extend({

		url: function(){
			return "/server/todo/" + this.propModel.get("listId") + "/";
		},

        model: TodoListItemModel,

        comparator: function (model) {
            return model.get("sortOrder");
        }

    });

	return ListItemCollection;

});