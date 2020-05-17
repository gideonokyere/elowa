const models = require('./models');
const blockexplorer = require('blockchain.info/blockexplorer')/**.usingNetwork(3)*/;
const {Expo} = require('expo-server-sdk');
const expo = new Expo();

const check=async()=>{
    await models.sequelize.transaction(async()=>{
        const tranx = await models.DepositQuery.findOne({where:{status:'pendding'},order:[['createdAt','DESC']]});
        //console.log(tranx.UserId);
        if(!tranx) return ;
        //console.log(tranx.raw);
         const decoded = await blockexplorer.getUnspentOutputs(tranx.address);
        //console.log(decoded.unspent_outputs);
        const lasttrans = decoded.unspent_outputs[decoded.unspent_outputs.length -1]
        //checking if confirmations >= 2
        if(!lasttrans.confirmations ==1 || !lasttrans.confirmations >=1) return;
    
        const getsysbalance = await models.SystemAc.findOne({where:{UserId:tranx.UserId}});
    
        await models.SystemAc.update({balance:getsysbalance.balance+tranx.amount},{where:{userId:tranx.UserId}});
        await models.DepositQuery.update({status:'completed'},{where:{id:tranx.id}});
        await models.Transactions.create({amount:tranx.amount,trxtype:'Credit',createdOn:Date.now(),userId:tranx.UserId});

        const getPushToken = await models.Notifications.findOne({where:{userId:tranx.UserId}});
        
        if(getPushToken.pushtoken){
            const message=[];
            const messagetosend = `A sum of $${tranx.amount} has been credited to your account`
             message.push({
               to:getPushToken.pushtoken,
               title:'Deposit Completed',
               sound:'default',
               body:messagetosend,
               data:{messagetosend}
            })

            await expo.sendPushNotificationsAsync(message);
        }
        
        return;
    });
}



module.exports = check;