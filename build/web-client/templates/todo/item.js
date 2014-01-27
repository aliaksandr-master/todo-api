define(['handlebars'], function(Handlebars) {

return Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return " checked=\"checked\"";
  }

  buffer += "<div class=\"todo-list-item\"><div class=\"todo-list-item-header clearfix\"><a href=\"/todo/";
  if (stack1 = helpers.listId) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.listId); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "/item/\" class=\"btn btn-default todo-list-item-back-btn\"><span class=\"glyphicon glyphicon-arrow-left\"></span><span class=\"glyphicon glyphicon-list-alt\"></span></a></div><div class=\"todo-list-item-head\"><input id=\"todo-list-item-chk\" class=\"chk todo-list-item-done-chk\" type=\"checkbox\" value=\"1\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.done), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "/><label for=\"todo-list-item-chk\" class=\"todo-list-item-done btn btn-default\" data-chk-on=\"Was Done\" data-chk-off=\"Done\"></label><button class=\"btn btn-success todo-list-item-save\"><span class=\"glyphicon glyphicon-ok\"></span>&nbsp;&nbsp;Save And Back To List</button></div><div class=\"todo-list-item-body\"><textarea placeholder=\"Comment\" class=\"todo-list-item-title form-control\">";
  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.title); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</textarea></div><div class=\"todo-list-item-foot\"><button class=\"todo-li-btn-remove btn btn-default\"><span class=\"glyphicon glyphicon-remove\"></span>&nbsp;&nbsp;Remove</button></div></div>";
  return buffer;
  })

});