define(['handlebars'], function(Handlebars) {

return Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "";


  buffer += "<div class=\"todo-lists\"><div class=\"todo-lists-add-btn-wr\"><a href=\"/todo/create/\" class=\"todo-lists-add-btn btn btn-success\"><span class=\"glyphicon glyphicon-plus\"></span>&nbsp;Add</a></div><ul class=\"todo-lists-l\"></ul></div>";
  return buffer;
  })

});