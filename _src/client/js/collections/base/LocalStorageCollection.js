define('LocalStorageCollection', function(require){
	"use strict";

	var bb = require('backbone');

	return bb.Collection.extend({

        _initLocalStorage:function(storageID){
            this.storageID = storageID;
            this.localStorage = new bb.LocalStorage("v"+storageID);
        }

    });

});