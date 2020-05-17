const models = require('../models');
const {Expo} = require('expo-server-sdk');

const expo = new Expo();

const investCheck=async()=>{
    await models.sequelize.transaction(async()=>{
        
        const invest = await models.Investments.findOne({where:{endDate:Date.now(),status:'active'},order:[['createdAt','DESC']]});
        if(!invest) return;

        /**getting user account */
        const account = await models.SystemAc.findOne({where:{userId:invest.userId}});
        await models.SystemAc.update({balance:account.balance+invest.amount},{where:{UserId:account.UserId}});
        await models.Investments.update({status:'due'},{where:{id:invest.id}});
        await models.Transactions.create({amount:invest.amount,trxtype:'Credit',createdOn:Date.now(),userId:invest.userId});

        /**getting user notification token */
        const getPushtoken = await models.Notification.findOne({where:{userId:invest.userId}});
         if(getPushtoken.pushtoken){
            let message = [];
            const messagetosend = `principal amount of $${invest.amount} has been credited to your account`;
            message.push({
                to:getPushtoken.pushtoken,
                title:'Investment Due',
                sound:'default',
                body:messagetosend,
                data:{messagetosend}
            })

            await expo.sendPushNotificationsAsync(message);
        }
        return;
    });
}

const closeInvest=async()=>{
    setInterval(investCheck,60000);
}

module.exports = closeInvest;