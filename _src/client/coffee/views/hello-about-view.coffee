define [
  'views/base/view'
  'text!templates/hello-about.hbs'
], (View, template) ->
  'use strict'

  class HelloAboutView extends View
    # Automatically render after initialize.
    autoRender: true
    className: 'hello-about'

    # Save the template string in a prototype property.
    # This is overwritten with the compiled template function.
    # In the end you might want to used precompiled templates.
    template: template
    template = null
