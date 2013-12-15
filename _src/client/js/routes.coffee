define ->
	'use strict'

	# The routes for the application. This module returns a function.
	# `match` is match method of the Router
	(match) ->
		match 'user/register', 'user#register'
		match 'user/login', 'user#login'
		match 'todo', 'todo#index'
		match 'todo/list/:id', 'todo#list'
		match 'todo/item/:listId/:ItemId', 'todo#list'
		match '', 'static#home'
		match 'about', 'static#about'
