require(["chaplin"],function(Chaplin){
	'use strict';

	var Application = Chaplin.Application.extend({});

	if(window.localStorage && localStorage.getItem("build") !== window.build){
		localStorage.clear();
		localStorage.setItem("build", window.build);
	}

	return new Application({

		routes: function(match){
			match('user/register/', 'user#register');
			match('user/profile/', 'user#profile');
			match('user/login/', 'user#login');
			match('todo/', 'todo#index');
			match('todo/:listId/', 'todo#list');
			match('todo/:listId/:itemId/', 'todo#item');
			match('', 'static#home');
			match('about/', 'static#about');
		},
		controllerSuffix: ''

	});

});