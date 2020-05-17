const getUserId = require('../utils');
const adminId = require('../adminUtils');

module.exports={

    Query:{
        
       penddingFunds:(parent,args,context,info)=>{
          adminId(context);
          return context.models.WithdrawFunds.findAll({where:{status:'pendding'},order:[['createdAt','DESC']]});
       },
       
       //counting pendding withdrawals
       countPenddin:async(parent,args,context,info)=>{
          const userId=getUserId(context);
          const penddin = await context.models.WithdrawFunds.findAll({where:{status:'pendding',userId:userId}});
          return penddin.length;
       },

       //withdrawal history of a user
       withdrawHistory:async(parent,{limit,offset},context,info)=>{
          const userId = getUserId(context);
          const getHistory = await context.models.WithdrawFunds.findAll({where:{userId},limit,offset,order:[['createdAt','DESC']]});
          return getHistory;
       }
    },

    Mutation:{

        requestFunds:async(parent,{amount},context,info)=>{
           const userId = getUserId(context);
           const user = await context.models.Users.findOne({where:{userId}});
           const account = await context.models.SystemAc.findOne({where:{UserId:userId}});
           if(amount>account.balance) throw new Error('Insufficient balance');
           const saveit = await context.models.WithdrawFunds.create({fullName:user.fullName,amount,date:Date.now(),userId});
           return saveit;
        }

    }

}