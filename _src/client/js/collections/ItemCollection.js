define('ItemCollection',[

    'App',
    'LocalStorageCollection',
    'ItemModel'

],function(App, LocalStorageCollection, ItemModel){
    "use strict";
    
    return LocalStorageCollection.extend({

        model: ItemModel,

        comparator: function(model){
            return model.get("sort_order");
        },

        initialize: function(o){
            this.listId=(o||{}).listId||0;
            this._initLocalStorage("item"+this.listId);
        }

    });

});