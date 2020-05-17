const explo = require('bitcore-explorers');
const bitcore = require('bitcore-lib');
const adminId = require('../adminUtils');
const trans = require('bitcoin-transaction');
const exchange = require('blockchain.info/exchange');
const blockexplorer = require('blockchain.info/blockexplorer')/**.usingNetwork(3)*/;
const pushtx = require('blockchain.info/pushtx')/**.usingNetwork(3)*/;
const axios = require('axios');

const insight = new explo.Insight(process.env.NETWORK);

module.exports={

Query:{

  allVaults:(parent,args,context,info)=>{
      adminId(context);
      return context.models.Vault.findAll();
  },

  vaultBalance:async(parent,args,context,info)=>{
      adminId(context);
      const Units = bitcore.Unit;
      const vault = await context.models.Vault.findOne({where:{id:args.id}});
      const btc = await axios.get(`https://api.blockcypher.com/v1/btc/${process.env.NETWORKS}/addrs/${vault.address}/balance`);
      //console.log(btc.data);
      const satoshi = btc.data.final_balance
      const usd = await exchange.fromBTC(satoshi,'USD');
      //console.log(usd);
      const tobtc = Units.fromSatoshis(satoshi).toBTC();
      //console.log(tobtc);

     
      return{
          name:vault.name,
          addressKey:vault.address,
          btc:tobtc,
          usd
      }
  }

},

Mutation:{

    newVault:async(parent,args,context,info)=>{
        adminId(context);

        const checkName = await context.models.Vault.findOne({where:{name:args.name}});
        if(checkName) throw new Error('Vault Name Already Exits');

        //create bitcoin address//
        const privateKey = await bitcore.PrivateKey.fromRandom(process.env.NETWORK);
        const publicKey = await bitcore.PublicKey(privateKey);
        const private = privateKey.toString();
        const address = await publicKey.toAddress().toString();

        //saving to database//
        return context.models.Vault.create({name:args.name,privateKey:private,address});
    },

    //sending funds from one to another//
     fundsToVault:async(parent,args,context,info)=>{
         adminId(context);
         
         const Units = bitcore.Unit;

         //Getting and checking from address if it exits//
         const from = await context.models.Vault.findOne({where:{name:args.from}});
         if(!from) throw new Error('Vault does not exits');

          //Getting and checking to address if it exits//
         const to = await context.models.Vault.findOne({where:{name:args.to}});
         if(!to) throw new Error('Vault does not exits');

         //converting amount from usd to btc//
         const tobtc = await exchange.toBTC(args.amount,'USD');
         
         //converting tbtc from bitcoin to satoshis//
         const amount = Units.fromBTC(tobtc).toSatoshis();

         return new Promise((resolve,reject)=>{
              insight.getUnspentUtxos(from.address,(err,utxos)=>{
                  if(err) return reject(err);

                  const myarr = utxos.map(d=>{
                      return d.satoshis;
                  });

                  //const reducer = (accumulator,currentValue)=>accumulator+currentValue;

                  const balance = myarr.reduce((a,b)=>a+b,0);

                  const fees = 20352;

                  if(amount>balance-fees) return reject('Insufficient Balance for this transaction and it fee');

                  if(fees>amount) return reject('Fee is more than the amount you are sending');

                  const transaction = bitcore.Transaction()
                  .fee(fees)
                  .from(utxos)
                  .to(to.address,amount)
                  .change(from.address)
                  .sign(from.privateKey)

                  const raw = transaction.serialize();

                  resolve(
                      insight.broadcast(raw,(err,txId)=>{
                          if(err) return reject(err);
                      })
                  );
              });
         });
        
     }
}

}