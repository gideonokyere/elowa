const models = require('../models');
const bitcore = require('bitcore-lib');
const exchange = require('blockchain.info/exchange');
const blockexplorer = require('blockchain.info/blockexplorer')/** .usingNetwork(3)*/;
const explo = require('bitcore-explorers');
const {Expo} = require('expo-server-sdk');
const units = bitcore.Unit;
const insight = new explo.Insight(process.env.NETWORK);
const expo = new Expo();

const paywithdraw = async()=>{

   const pendding = await models.WithdrawFunds.findOne({where:{status:'pendding'},order:[['createdAt','DESC']]});
   if(!pendding) return;

   const vault = await models.Vault.findOne({where:{name:'payout'}});

   const account = await models.SystemAc.findOne({where:{UserId:pendding.userId}});
   const toAddress = await models.Accounts.findOne({where:{userId:account.UserId}});

   //checking if amount > balance//
   if(pendding.amount>account.balance){
       await models.sequelize.transaction(async()=>{

        await models.WithdrawFunds.update({status:'cancel'},{where:{id:pendding.id}});
        const getPushToken = await models.Notifications.findOne({where:{userId:pendding.userId}});

        if(getPushToken.pushtoken){
          let message=[];
          const messagetosend = 'Withdrawal has been cancel due to insuffient balance'
          message.push({
            to:getPushtoken.pushtoken,
            sound: 'default',
            title:'Withdrawal Cancel',
            body:messagetosend,
            data:{messagetosend}
          });
          await expo.sendPushNotificationsAsync(message);
        }
        return
       });
   }else{

   //converting amount from USD to BTC
   const tobtc = await exchange.toBTC(pendding.amount,'USD');
   //converting amount from BTC to Satoshis;
   const amount = units.fromBTC(tobtc).toSatoshis();

   const decoded = await blockexplorer.getUnspentOutputs(vault.address);

   const lasttrans = decoded.unspent_outputs[decoded.unspent_outputs.length -1];

    //checking if confirmations >= 2
    if(!lasttrans.confirmations ==1 || !lasttrans.confirmations >=1) return;

   return new Promise(async(resolve,reject)=>{
      insight.getUnspentUtxos(vault.address,(err,utxos)=>{
          if(err) return reject(err);

          const myarr = utxos.map(d=>{
              return d.satoshis;
          });

          const reducer = (accumulator,currentValue)=>accumulator+currentValue;
          const balance = myarr.reduce(reducer);
          const fees = process.env.BTCFEE;

          if(amount>balance-fees) return reject('Insufficient Balance for this transaction');
          if(fees>amount) return reject('The fee is more than the amount you are sending');

          const transaction = bitcore.Transaction()
          .fee(fees)
          .from(utxos)
          .to(toAddress.addressKey,amount)
          .change(vault.address)
          .sign(vault.privateKey)

          const raw = transaction.serialize();

          const takeAction=async()=>{
               insight.broadcast(raw,(err,txid)=>{
                if(err) return reject(err);
            }),
            await models.sequelize.transaction(async()=>{
               await models.SystemAc.update({balance:account.balance-pendding.amount},{where:{UserId:pendding.userId}});
               await models.WithdrawFunds.update({status:'paid'},{where:{id:pendding.id}});
               await models.Transactions.create({amount:pendding.amount,trxtype:'Debit',createdOn:Date.now(),userId:pendding.userId});

              const getPushTokens = await models.Notifications.findOne({where:{userId:pendding.userId}});

              if(getPushTokens.pushtoken){
                  let messages=[];
                  const messagetosend = 'withdrawal has been accepted and waiting for network confirmation';
                  messages.push({
                    to:getPushTokens.pushtoken,
                    title:'Withdrawal accepted',
                    sound:'default',
                    body:messagetosend,
                    data:{messagetosend}
                  });

                  await expo.sendPushNotificationsAsync(messages);
              }
              return;
            })
          }

          resolve (
          takeAction(),
        );

      });
   });
  }
}

const checkWithdraw = () =>{
    setInterval(paywithdraw,60000);
}

module.exports=checkWithdraw;