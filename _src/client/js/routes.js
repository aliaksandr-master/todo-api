define(function(require, exports, module){
    "use strict";

    return function(match){
		match('user/register/', 'user#register');
		match('user/profile/', 'user#profile');
		match('user/login/', 'user#login');
		match('todo/', 'todo#index');
		match('todo/share/:listId/', 'todo#share');
		match('todo/create/', 'todo#create');
		match('todo/:listId/', 'todo#list');
		match('todo/:listId/:itemId/', 'todo#item');
		match('', 'static#home');
		match('about/', 'static#about');
	};
});