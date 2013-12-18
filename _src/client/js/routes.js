define(function(require, exports, module){
    "use strict";

	return function(match){
		match('user/register/', 'user#register');
		match('user/profile/', 'user#profile');
		match('user/login/', 'user#login');
		match('todo/', 'todo#index');
		match('todo/:listId/', 'todo#list');
		match('todo/:listId/:ItemId/', 'todo#list');
		match('', 'static#home');
		match('about/', 'static#about');
	};

});