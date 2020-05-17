require('dotenv').config();
const {GraphQLServer} = require('graphql-yoga');
const path = require('path');
//const express = require('express');
const {fileLoader,mergeTypes,mergeResolvers} = require('merge-graphql-schemas');
const models = require('./models');
const typeDefs = mergeTypes(fileLoader(path.join(__dirname,'./schema')));
const resolvers = mergeResolvers(fileLoader(path.join(__dirname,'./resolvers')));
const check = require('./transCheck');
const payWeekly = require('./automations/payweek');
const closeInvest = require('./automations/endinvest');
const checkWithdraw = require('./automations/payWithdrawal');



     /** setInterval(check,120000);*/
   /** payWeekly();*/
   /** closeInvest();*/
    /** checkWithdraw();*/

const opts={
    port:5000,
    endpoint:'/graphql'
}


const server = new GraphQLServer({ 
  typeDefs,
  resolvers,
  context:req=>({
    ...req,
    models
  }),
  formatError:({GraphQLError})=>{
    const error = GraphQLError
    //console.log(error);
  }

 });

server.start(opts, () => models.sequelize.sync().then(()=>{
  console.log(`Server is running port ${opts.port}`)
}).error((error)=>{
  console.log(error);
})
)
 
