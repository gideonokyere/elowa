const adminId = require('../adminUtils');
const axios = require('axios');
module.exports={

    Query:{
       allPackages:async(parent,args,{models},info)=>{
           return models.Packages.findAll({order:[['startAmount','ASC']]});
       },

       packageDetail:async(parent,{id},{models},info)=>{
           const package = await models.Packages.findOne({where:{id}});
           const btc = await axios.get(`https://blockchain.info/tobtc?currency=USD&value=${package.startAmount}`);
           return{
               id:package.id,
               name:package.name,
               startAmount:package.startAmount,
               weeks:package.weeks,
               interest:package.interest,
               describtion:package.describtion,
               btc:btc.data
           }
       },
       
       packageDetails:async(parent,{id},{models},info)=>{
        const package = await models.Packages.findOne({where:{id}});
        const btc = await axios.get(`https://blockchain.info/tobtc?currency=USD&value=${package.startAmount}`);
        return{
            id:package.id,
            name:package.name,
            startAmount:package.startAmount,
            weeks:package.weeks,
            interest:package.interest,
            describtion:package.describtion,
            btc:btc.data
        }
    },

    },

    Mutation:{
        //create new package
        newPackage:(parent,args,context,info)=>{
            adminId(context);
            return context.models.Packages.create(args);
        },

        //edit package
        editPackage:(parent,{name,startAmount,weeks,interest,describtion,id},context,info)=>{
            adminId(context);
            return context.models.Packages.update({name,startAmount,weeks,interest,describtion},{where:{id}});
        },

        //delete package
        deletePackage:(parent,{id},context,info)=>{
            adminId(context);
            return context.models.Packages.destroy({where:{id}});
        }
    }

}