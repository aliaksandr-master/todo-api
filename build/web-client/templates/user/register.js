define(['handlebars'], function(Handlebars) {

return Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class=\"user-register\"><form action=\"/user/\" data-name=\"register\" method=\"post\"><br><h1>Create New Profile</h1><br/><br/><div class=\"form-group\"><label>Username</label><input type=\"text\" name=\"username\" placeholder=\"\" maxlength=\"40\" class=\"form-control input-lg\"></div><div class=\"form-group\"><label>Email</label><input type=\"text\" name=\"email\" maxlength=\"255\" class=\"form-control input-lg\"></div><div class=\"form-group\"><label>Password</label><input type=\"password\" name=\"password\" maxlength=\"255\" class=\"form-control input-lg\"></div><div class=\"form-group\"><label>Confirm Password</label><input type=\"password\" name=\"confirm_password\" maxlength=\"255\" class=\"form-control input-lg\"></div><div class=\"form-group text-right form-submits\"><a href=\"/user/login/\" style=\"margin-right: 30px\" class=\"btn btn-link\">Sign In</a><button type=\"submit\" class=\"btn btn-warning btn-lg register-submit\">Try Service</button></div></form></div>";
  })

});