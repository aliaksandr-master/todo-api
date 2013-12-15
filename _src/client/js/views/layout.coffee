define [
	'views/base/view'
	'templates/simple-layout'
], (BaseView, template) ->
	'use strict'

	class LayoutView extends BaseView
		container: 'body'
		regions:
			main: '#main-container'
		template: template
		template = null
