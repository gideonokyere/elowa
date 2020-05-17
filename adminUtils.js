const jwt = require('jsonwebtoken');

function adminId(context){
    const Authorization = context.request.get('Authorization')
    if (Authorization) {
      const token = Authorization.replace('Bearer ', '')
      const user  = jwt.verify(token, process.env.JWT_SECRET);
      return user.user.id;
    }
    throw new Error('Not authenticated');
  }

  module.exports = adminId;
