const bitcore = require('bitcore-lib');
const getUserId = require('../utils');
const axios = require('axios');
//const blockexplorer = require('blockchain.info/blockexplorer').usingNetwork(3);
const exchange = require('blockchain.info/exchange');
const explo = require('bitcore-explorers');
const insight = new explo.Insight(process.env.NETWORK);

module.exports={

    Query:{
        // getting user balance//
        accountBalance:async(parent,args,context,info)=>{
            const userId = getUserId(context);
            const Units = bitcore.Unit;
            const user = await context.models.Accounts.findOne({where:{userId}});
            const sysac = await context.models.SystemAc.findOne({where:{userId}});
            const btc = await axios.get(`https://api.blockcypher.com/v1/btc/${process.env.NETWORKS}/addrs/${user.addressKey}/balance`);
            //console.log(btc.data);
            const satoshi = btc.data.final_balance
            const usd = await exchange.fromBTC(satoshi,'USD');
            //console.log(usd);
            const tobtc = Units.fromSatoshis(satoshi).toBTC();
            //console.log(tobtc);
            return{
                sysac:sysac.balance,
                btc:tobtc,
                usd
            }
           
        },//getting user balance

        //getting current btc price//
        getBtcPrice:async(parent,args,context,info)=>{
            try {
                const prices = await axios.get("https://blockchain.info/ticker");
                return{
                    USD:prices.data.USD.buy,
                    GBP:prices.data.GBP.buy,
                    EUR:prices.data.EUR.buy
                }
            } catch (error) {
                throw new Error('Network Error');
            }
        },//getting btc price

        //getting user address
        userAddress:(parent,args,context,info)=>{
            const userId = getUserId(context);
            return context.models.Accounts.findOne({where:{userId}});
        },

        //counting pendding deposit
        penddingDeposit:async(parent,args,context,info)=>{
           const userId = getUserId(context);
           const penddin = await context.models.DepositQuery.findAll({where:{status:'pendding',userId:userId}});
           return penddin.length;
        },

        //geting transaction by id//
        rawTrans:async(parent,args,{models},info)=>{
            const trans = await models.DepositQuery.findOne({where:{status:'pendding'},order:[['createdAt','DESC']]});
            if(!trans) return;
            //const transId = await blockexplorer.getTx(trans.txId);
            insight.getTransactions(trans.txId,(err,txId)=>{
                if(err) throw new Error(err);
                console.log(txId);
            })
            //console.log(transId);
           
        }

    },

    /** Mutation */
    Mutation:{

    sendCoins:async(parent,args,context,info)=>{
        const userId = getUserId(context);
        const address = bitcore.Address;
        const user = await context.models.Accounts.findOne({where:{userId}});
        const validAddress = address.isValid(args.to,process.env.NETWORK);
        /** checking to see if address is valid */
        if(!validAddress){
            throw new Error('Invalid Bitcoin Address');
        }

        return new Promise(async(resolve,reject)=>{
            const Units = bitcore.Unit;
            const amount = Units.fromBTC(args.amount).toSatoshis();
            
            insight.getUnspentUtxos(user.addressKey,(err,utxos)=>{
                if(err) return reject(err);

                 const myarr = utxos.map(d=>{
                    return d.satoshis;
                });
                 
                //const reducer = (accumulator,currentValue)=>accumulator+currentValue;
                const balance = myarr.reduce((a,b)=>a+b,0);
                const fees = 20352;
                
                if(amount>balance-fees) return reject('Insufficient Balance for this transaction');
                if(fees>amount) return reject('The fee is more than the amount you are sending');

                
                const transaction = bitcore.Transaction()
                .fee(fees)
                .from(utxos)
                .to(args.to,amount)
                .change(user.addressKey)
                .sign(user.privateKey)
                
                const raw = transaction.serialize();

                resolve(
                    insight.broadcast(raw,(err,txId)=>{
                        if(err) return reject('Transaction field please try again');
                    })
                );

            });
        });

        
       
        
    },
      
    /** making a deposit to system account */
    makeDeposit:async(parent,args,context,info)=>{
        const UserId = getUserId(context);
        const user = await context.models.Accounts.findOne({where:{UserId}});
            if(!user) throw new Error('No User Found');
        const vault = await context.models.Vault.findOne({where:{name:'deposits'}});
             
            if(!vault) throw new Error('Vault Needed for this transaction');
        return new Promise(async(resolve,reject)=>{

            const Units = bitcore.Unit;
            //converting amount from USD to BTC
            const tobtc = await exchange.toBTC(args.amount,'USD');
            //converting amount from BTC to Satoshis
            const amount = Units.fromBTC(tobtc).toSatoshis();

            insight.getUnspentUtxos(user.addressKey,function(err,utxos){
                if(err){
                   return reject(err);
                }else{

                   //getting my balance balance//
                  const myarr = utxos.map(d=>{return d.satoshis});
                  //const reducer = ((accumulator,currentValue)=>accumulator+currentValue,0);
                  const balance =  myarr.reduce((a,b)=>a+b,0);
                  const fees = 20352;
                  if(amount>balance-fees) return reject('Insufficient Balance for this transaction');

                  if(fees>amount) return reject('The fee is more than the amount you are sending');

                  //creating a transaction
                 const transaction = bitcore.Transaction()
                 .fee(fees)
                 .from(utxos)
                 .to(vault.address,amount)
                 .change(user.addressKey)
                 .sign(user.privateKey)

                 const raw = transaction.serialize();
                 //console.log(raw)
                 resolve(
                      insight.broadcast(raw,(err,txId)=>{
                          if(err) return reject('Transaction aborted');
                          context.models.DepositQuery.create({amount:args.amount,address:user.addressKey,createdOn:Date.now(),UserId:user.userId});
                      })
                    )

                }
            });

        });
          
    },

    //sending funds to user//
    fundsToUser:async(parent,args,context,info)=>{

        const userId = getUserId(context);
        const user = await context.models.Accounts.findOne({where:{userId}});
        if(!user) throw new Error('Invalid User Token');
        const receiver = await context.models.Users.findOne({where:{email:args.email}});
        if(!receiver) throw new Error('Ivalid email address');
        const receiverId = await context.models.Accounts.findOne({where:{userId:receiver.userId}});
        if(!receiverId) throw new Error('Ivalid email address');

        const Units = bitcore.Unit;
        const tobtc = await exchange.toBTC(args.amount,'USD');
        const amount = Units.fromBTC(tobtc).toSatoshis();

        return new Promise((resolve,reject)=>{
            insight.getUnspentUtxos(user.addressKey,(err,utxos)=>{

                if(err) return reject(err);
                
                const myarr = utxos.map(d=>{
                    return d.satoshis;
                });

                //const reducer = (accumulator,currentValue)=>accumulator+currentValue;
                const balance = myarr.reduce((a,b)=>a+b,0);
                const fees = 20352;

                if(amount>balance-fees) return reject('Insufficient Balance for this transaction');
                if(fees>amount) return reject('The fee is more than the amount you are sending');

                const transaction = bitcore.Transaction()
                .fee(fees)
                .from(utxos)
                .to(receiverId.addressKey,amount)
                .change(user.addressKey)
                .sign(user.privateKey)

                const raw = transaction.serialize()

                resolve(
                   insight.broadcast(raw,(err,txId)=>{
                       if(err) return reject('Transaction Field');
                   })
                )
            });
        });
    }

    }/** end of mutation */

}