
function AccessNotAllowed() {}
AccessNotAllowed.prototype = Object.create(Error.prototype);

exports.AccessNotAllowed = AccessNotAllowed;