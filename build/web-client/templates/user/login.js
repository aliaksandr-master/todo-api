define(['handlebars'], function(Handlebars) {

return Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class=\"user-login\"><form action=\"/user/login/\" data-name=\"login\" method=\"POST\"><br><h1>Sign In</h1><br><br><div class=\"form-group\"><label>Login</label><input type=\"text\" name=\"username\" class=\"form-control input-lg\"></div><div class=\"form-group\"><label>Password</label><input type=\"password\" name=\"password\" class=\"form-control input-lg\"></div><div class=\"form-group text-right\"><a href=\"/user/register/\" style=\"margin-right: 30px\" class=\"btn btn-link\">Create Profile</a><button type=\"submit\" class=\"login-submit btn-lg btn btn-warning\">Enter</button></div></form></div>";
  })

});