define('LocalStorageCollection', [

    'Backbone'

], function(bb){
	"use strict";

	return bb.Collection.extend({

        _initLocalStorage:function(storageID){
            this.storageID = storageID;
            this.localStorage = new bb.LocalStorage("v"+storageID);
        }

    });

});