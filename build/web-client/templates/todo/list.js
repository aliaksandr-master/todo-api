define(['handlebars'], function(Handlebars) {

return Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"todo-list\"><div class=\"todo-list-back-wr\"><a href=\"/todo/\" class=\"btn btn-default todo-list-back\"><span class=\"glyphicon glyphicon-arrow-left\"></span><span class=\"glyphicon glyphicon-list-alt\"></span></a></div><div class=\"todo-list-title-wr\"><input type=\"text\" class=\"-click2edit -txt-center form-control todo-list-title\" placeholder=\"My tasks\" value=\"";
  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.title); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"/></div><div class=\"todo-list-line\"></div><div class=\"todo-list-head\"><div class=\"input-group todo-list-task-input-wr\"><input type=\"text\" class=\"form-control todo-list-input-add\"  placeholder=\"Add new task here...\"><div class=\"input-group-btn\"><button type=\"button\" class=\"btn btn-warning todo-list-input-add-submit\"><span class=\"glyphicon glyphicon-plus\"></span> ADD</button></div></div></div><div class=\"todo-list-body\"><ul class=\"todo-list-l\"></ul></div></div>";
  return buffer;
  })

});