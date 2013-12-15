define [
	'controllers/base/controller'
	'views/pages/home'
	'views/pages/about'
], (
	BaseController,
	HomePageView,
	AboutPageView
) ->
	'use strict'

	class StaticController extends BaseController

		home: (params) ->
			@view = new HomePageView
				region: 'main'

		about: (params) ->
			@view = new AboutPageView
				region: 'main'
