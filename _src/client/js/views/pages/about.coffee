define [
	'views/base/view'
	'templates/pages/about'
], (View, template) ->
	'use strict'

	class HomePageView extends View
		# Automatically render after initialize.
		autoRender: true

		# Save the template string in a prototype property.
		# This is overwritten with the compiled template function.
		# In the end you might want to used precompiled templates.
		template: template
		template = null
