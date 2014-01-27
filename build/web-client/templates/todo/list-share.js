define(['handlebars'], function(Handlebars) {

return Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, self=this, functionType="function", escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  
  return " checked=\"checked\"";
  }

function program3(depth0,data) {
  
  
  return " -active";
  }

  buffer += "<div class=\"todo-list-share\"><div class=\"todo-list-share-head\"><input id=\"todo-list-share-chk\" class=\"chk todo-list-share-chk\" type=\"checkbox\" value=\"1\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.shared), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "/><label for=\"todo-list-share-chk\" class=\"todo-list-share-chk-btn btn btn-default pull-left\" data-chk-on=\"This List Shared\" data-chk-off=\"Share This Link\"></label><button class=\"pull-right btn btn-success todo-list-share-save\"><span class=\"glyphicon glyphicon-ok\"></span>&nbsp;&nbsp;Save And Back</button></div><div class=\"todo-list-share-body\"><div class=\"todo-list-share-link-wr";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.shared), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"><div class=\"input-group\"><span class=\"input-group-addon\">Link to Share:</span><input class=\"form-control todo-list-share-link\" type=\"text\" value=\"";
  if (stack1 = helpers.link) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.link); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"/></div></div></div></div>";
  return buffer;
  })

});