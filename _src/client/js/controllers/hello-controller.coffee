define [
  'controllers/base/controller'
  'models/hello-world'
  'views/hello-world-view'
  'views/hello-about-view'
], (Controller, HelloWorld, HelloWorldView, HelloAboutView) ->
  'use strict'

  class HelloController extends Controller
    show: (params) ->
      alert 2
      @model = new HelloWorld()
      @view = new HelloWorldView
        model: @model
        region: 'main'
    about: (params) ->
      alert 1
      @model = new HelloWorld()
      @view = new HelloAboutView
        model: @model
        region: 'main'
