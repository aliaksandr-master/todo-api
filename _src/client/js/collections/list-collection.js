define('ListCollection',[

    'App',
    'LocalStorageCollection',
    'ListModel'

],function(App, LocalStorageCollection, ListModel){
    "use strict";

    return LocalStorageCollection.extend({

        model: ListModel,

        initialize: function(o){
            this.listId=(o||{}).listId||0;
            this._initLocalStorage("list"+this.listId);
        }

    });

});