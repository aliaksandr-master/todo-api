define(['handlebars'], function(Handlebars) {

return Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, options, self=this, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  return " -done";
  }

  buffer += "<li class=\"todo-list-li";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.done), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" data-itemId=\"";
  if (stack1 = helpers.itemId) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.itemId); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"><span class=\"glyphicon glyphicon-resize-vertical todo-list-li-move\"></span><a href=\"/todo/";
  if (stack1 = helpers.listId) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.listId); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "/item/";
  if (stack1 = helpers.itemId) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.itemId); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "/\" class=\"todo-list-li-link\">";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.firstRow || (depth0 && depth0.firstRow)),stack1 ? stack1.call(depth0, (depth0 && depth0.title), options) : helperMissing.call(depth0, "firstRow", (depth0 && depth0.title), options)))
    + "</a></li>";
  return buffer;
  })

});