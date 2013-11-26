define('OptionsCollection',[

    'App',
    'LocalStorageCollection',
    'OptionModel'
    
],function(App, LocalStorageCollection, OptionModel){
    "use strict";
    
    return LocalStorageCollection.extend({

        model: OptionModel,

        initialize: function(o){
            this.storageID=(o||{}).storageID||0;
            this._initLocalStorage("option"+this.storageID);
        }

    });
});