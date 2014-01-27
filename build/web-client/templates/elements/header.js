define(['handlebars'], function(Handlebars) {

return Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div><header class=\"header clearfix\"><a href=\"#\" class=\"btn btn-success add-todo-btn btn-lg\"><span class=\"glyphicon glyphicon-plus\"></span></a></header><div class=\"clearfix todo-turn-wr\"><button class=\"btn btn-default todo-turn--inactive todo-turn btn-lg todo-turn--left pull-left\"><span class=\"glyphicon glyphicon-chevron-left\"></span></button><button class=\"btn btn-default todo-turn--inactive todo-turn btn-lg todo-turn--right pull-right\"><span class=\"glyphicon glyphicon-chevron-right\"></span></button></div><div class=\"todo-wr\"></div></div>";
  })

});