const getUserId = require('../utils');
const {Expo} = require('expo-server-sdk');
const expo = new Expo();

module.exports = {

    Query:{

       myPack:(parent,{limit,cursor},context,info)=>{
           const userId = getUserId(context);
           return context.models.Pack.findAll({where:{alphaId:userId,id:{$gt:cursor}},limit:limit,order:[['id','ASC']]});
       },

       countPack:async(parent,args,context,info)=>{
           const userId = getUserId(context);
           const packs = await context.models.Pack.findAll({where:{alphaId:userId}});
           return packs.length;
       }

    },

    Mutation:{

        joinPack:async(parent,{email},context,info)=>{
           const userId = getUserId(context);
           await context.models.sequelize.transaction(async()=>{
              //beta profile//
              const beta = await context.models.Users.findOne({where:{userId}});
              //alpha profile//
              const alpha = await context.models.Users.findOne({where:{email}});
              //check if user exits//
              if(!alpha) throw new Error('No User Found');
              //check if user is joining his own pack//
              if(beta.email === email) throw new Error('You can not join your own pack as a beta');
              //check if user has already join a pack//
              const hasPack = await context.models.Pack.findOne({where:{betaId:userId}});
              if(hasPack) throw new Error('You already belongs to a pack');
              const circlePack = await context.models.Pack.findOne({where:{alphaId:beta.userId,betaId:alpha.userId}});
              if(circlePack) throw new Error('beta belongs to your pack');

              //checking if beta have an investment//
              const invest = await context.models.Investments.findOne({where:{userId},order:[['createdAt','ASC']]});
              if(invest){
                  const percentage = 5/100*invest.amount;
                  const alphaBalance = await context.models.SystemAc.findOne({where:{userId:alpha.userId}});
                  await context.models.SystemAc.update({balance:alphaBalance.balance+percentage},{where:{userId:alpha.userId}});
                  await context.models.Pack.create({betaId:beta.userId,betaFullName:beta.fullName,joinDate:Date.now(),payAlpha:true,alphaId:alpha.userId});
                  await context.models.Transactions.create({amount:percentage,trxtype:'Credit',createdOn:Date.now(),userId:alpha.userId});
                  
                  //getting alpha notification token//
                  const getPushToken = await context.models.Notifications.findOne({where:{userId:alpha.userId}});

                  if(getPushToken.pushtoken){
                     let message=[];
                     message.push({
                        to:getPushToken.pushtoken,
                        title:'Congratulations',
                        sound:'default',
                        body:`${beta.fullName} jsut join your pack and $${percentage} has been credited to your account as 5% from his/her first investment`
                     });
                     await expo.sendPushNotificationsAsync(message);
                  }
              }else{
                await context.models.Pack.create({betaId:beta.userId,betaFullName:beta.fullName,joinDate:Date.now(),alphaId:alpha.userId});
                const tokenOnly = await context.models.Notifications.findOne({where:{userId:alpha.userId}});
                if(tokenOnly.pushtoken){
                    let message=[]
                    message.push({
                        to:tokenOnly.pushtoken,
                        title:'Congratulations',
                        sound:'default',
                        body:`${beta.fullName} jsut join your pack`
                    });
                    await expo.sendPushNotificationsAsync(message);
                }
              }
            });
        }
    }

}
