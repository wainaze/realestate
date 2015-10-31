exports.userHasRole = function(role, redirectTo) {  
  var url = redirectTo || '/home.html';

  return function(req, res, next) {
    var user = req.user; 
    if (user.roles.indexOf(role) < 0)
      return res.redirect(url);
    next();
  }
}

exports.checkUserHasRole = function(user, role) {
    return user.roles.indexOf(role) >= 0;
}