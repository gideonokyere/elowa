const models = require('../models');
const {Expo} = require('expo-server-sdk');

const expo = new Expo();

const payweek =async()=>{
   await models.sequelize.transaction(async()=>{

      const pay = await models.WeeklyPay.findOne({where:{status:'Not Paid',date:Date.now()},order:[['createdAt','DESC']]});
      if(!pay) return;

      /**checking if pay date < 7 days */
      const days = pay.date-Date.now();
      console.log(days);
      return;
      
      /**getting user account */
     const account = await models.SystemAc.findOne({where:{UserId:pay.userId}});
     await models.SystemAc.update({balance:account.balance+pay.amount},{where:{UserId:account.UserId}});
     await models.WeeklyPay.update({status:'Paid'},{where:{id:pay.id}});
     await models.Transactions.create({amount:pay.amount,trxtype:'Credit',createdOn:Date.now(),userId:pay.userId});

     /**getting user push notification token  */
     const getPushtoken = await models.Notifications.findOne({where:{userId:pay.userId}});

      if(getPushtoken.pushtoken) {
        let message = [];
        const messagetosend = `Interest of $${pay.amount} has been credited to your account`;
        message.push({
           to:getPushtoken.pushtoken,
           title:'Interest Paid',
           sound:'default',
           body:messagetosend,
           data:{messagetosend}
        })
        await expo.sendPushNotificationsAsync(message);
     }
      return
   });
}

const payWeekly =()=>{
    setInterval(payweek,6000);
}

module.exports=payWeekly;