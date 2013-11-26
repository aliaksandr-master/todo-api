define('LocalStorageCollection', [

    'Backbone'

], function(bb){

    return bb.Collection.extend({

        _initLocalStorage:function(storageID){
            this.storageID = storageID;
            this.localStorage = new bb.LocalStorage("v"+storageID);
        }

    });

});