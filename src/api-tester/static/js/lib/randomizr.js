define(function(require, exports, module){
    'use strict';



    return {
		string: function(length, hasNumber){
			var text = "",
				possible = "abcdefghijklmnopqrstuvwxyz" + (hasNumber ? '0123456789' : '');
			for( var i=0; i < length; i++ ){
				text += possible.charAt(Math.floor(Math.random() * possible.length));
			}
			return text;
		},

		integer: function(start, stop){
			return Math.ceil((start||0) + Math.random() * stop);
		},

		boolean: function(){
			return Boolean(window.randomInteger(0, 2) - 1);
		}
	};
});