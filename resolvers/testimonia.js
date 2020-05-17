const getUserId = require('../utils');
const adminId = require('../adminUtils');

module.exports = {
    Query:{

       allTestimonia:(parent,{limit,offset},{models},info)=>{
          return models.Testimonia.findAll({limit,offset,order:[['createdAt','DESC']]});
       }

    },
    Mutation:{
       addTestimonia:async(parent,{content},context,info)=>{
          const userId = getUserId(context);
          const user = await context.models.Users.findOne({where:{userId}});
          const createTestimonia = await context.models.Testimonia.create({fullName:user.fullName,content,date:Date.now()});
          return createTestimonia;
       },

       adminPost:async(parent,{fullName,content,date},context,info)=>{
          const admin = adminId(context);
          const post = await context.models.Testimonia.create({fullName,content,date});
          return post;
       }

    }
}