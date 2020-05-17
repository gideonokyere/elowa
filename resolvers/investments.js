const getUserId = require('../utils');
const getAdmin = require('../adminUtils');
const {Expo} = require('expo-server-sdk');
const expo = new Expo();

module.exports={

    InvestMents:{
        PayWeekly:async(parent,args,context,info)=>{
           return context.models.WeeklyPay.findAll({where:{InvestmentId:parent.id}});
        },
        User:async(parent,args,context,info)=>{
            return context.models.Users.findOne({where:{userId:parent.userId}});
        }
    },

    Query:{
       myInvest:async(parent,args,context,info)=>{
           const userId=getUserId(context);
           return context.models.Investments.findAll({where:{userId,status:'active',id:{$gt:args.cursor}},limit:args.limit,order:[['id','ASC']]});
       },
       investDetail:async(parent,args,context,info)=>{
           getUserId(context);
           return context.models.Investments.findOne({where:{id:args.id}});
       },
       dueInvest:async(parent,args,context,info)=>{
           const userId = getUserId(context);
           return context.models.Investments.findAll({where:{userId,status:'due',id:{$gt:args.cursor}},limit:args.limit,order:[['id','ASC']]});
       },
       countActive:async(parent,args,context,info)=>{
           const userId = getUserId(context);
           const totalActive = await context.models.Investments.findAll({where:{status:'active',userId:userId}});
           return totalActive.length;
       },
       countDue:async(parent,args,context,info)=>{
          const userId = getUserId(context);
          const totalDue = await context.models.Investments.findAll({where:{status:'due',userId:userId}});
          return totalDue.length;
       },

       //count active investment
       totalActive:async(parent,args,{models},info)=>{
           const totalactive = await models.Investments.findAll({where:{status:'active'}});
           return totalactive.length
       },
       //count due investment
       totalDue:async(parent,args,{models},info)=>{
           const totaldue = await models.Investments.findAll({where:{status:'due'}});
           return totaldue.length
       },
       //count todays due
       dueToday:async(parent,args,{models},info)=>{
           const duetoday = await models.Investments.findAll({where:{endDate:Date.now()}});
           return duetoday.length
       },
       //total investment amount
       totalInvestAmount:async(parent,args,{models},info)=>{
           const totalamount = await models.Investments.sum('amount',{where:{status:'active'}});
           return totalamount;
       },
       //total interest amount
       totalInterestAmount:async(parent,args,{models},info)=>{
           const totalinterest = await models.WeeklyPay.sum('amount',{where:{status:'Not Paid'}});
           return totalinterest;
       },

       //getting active inverstment
       activeInvestments:async(parent,args,context,info)=>{
           getAdmin(context);
           const invest = await context.models.Investments.findAll({where:{status:'active'},order:[['endDate','ASC']]});
           return invest;
       }
    },
  
    Mutation:{

       newInvestment:async(parent,{packageName,amount,rate,weeks},context,info)=>{
           const userId = getUserId(context);
         await context.models.sequelize.transaction(async()=>{
             const userBalance = await context.models.SystemAc.findOne({where:{userId}});

             //checking user balance
             if(amount>userBalance.balance) throw new Error("You don't have enough funds to perform this transaction");

             //Setting duration date//
            const week = 7;
            const dayss = weeks*week;
            const today = Date.now();
            const date = new Date(today);
            const finalDate = date.toUTCString();
            const startDate = new Date(finalDate);
            const endDate = new Date(finalDate);
            endDate.setDate(startDate.getDate()+dayss-7);

            const intPerWeek = rate/100*amount;
            const totalInt = intPerWeek*weeks;
            const totalall = totalInt+amount;

            const saveInvest = await context.models.Investments.create({package:packageName,amount,interest:intPerWeek,total:totalInt,totalI:totalall,rate,weeks,startDate,endDate,userId});
            
            const payArr = [];

            for(const d = startDate; d <= endDate;d.setDate(d.getDate()+7)){
                const payDate = new Date(d+7);
                payArr.push(payDate);
                //await context.models.WeeklyPay.create({amount:intPerWeek,date:payDate,InvestmentId:saveInvest.id,userId});
            }

            const new_Arr = payArr.slice(1);

            new_Arr.map(async(d)=>{
                await context.models.WeeklyPay.create({amount:intPerWeek,date:d,InvestmentId:saveInvest.id,userId});
            });


            await context.models.SystemAc.update({balance:userBalance.balance-amount},{where:{userId}});
            await context.models.Transactions.create({amount,trxtype:'Debit',createdOn:Date.now(),userId});

            //given 10% to user if amount is >=200//
            if(amount>=200){
                const share = 10/100*amount;
                await context.models.SystemAc.update({balance:userBalance.balance+share},{where:{userId}});
                await context.models.Transactions.create({amount,trxtype:'Credit',createdOn:Date.now(),userId});
             }
             //end of given

            const beta = await context.models.Pack.findOne({where:{betaId:userId}});

            if(!beta){return saveInvest;}

            if(beta.payAlpha == false){
                const  percentage = 5/100*amount;
                const alphaBalance = await context.models.SystemAc.findOne({where:{userId:beta.alphaId}});
                await context.models.SystemAc.update({balance:alphaBalance.balance+percentage},{where:{userId:beta.alphaId}});
                await context.models.Transactions.create({amount:percentage,trxtype:'Credit',createdOn:Date.now(),userId:beta.alphaId});

                //getting alpha notification token//
                const getPushToken = await context.models.Notifications.findOne({where:{userId:beta.alphaId}});

                if(!getPushToken){return saveInvest;}

                if(getPushToken.pushtoken){
                   let message = [];
                   message.push({
                       to:getPushToken.pushtoken,
                       title:'Congratulations',
                       sound:'default',
                       body:`${percentage} has been credited to your account as 5% from ${beta.betaFullName} first investment.`
                   });
                    await expo.sendPushNotificationsAsync(message);
                }
            }


            return saveInvest;
         });
       }

    }

}