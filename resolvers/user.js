const fs = require('fs');
const hogan = require('hogan.js');
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const bcrypt = require('bcrypt');
const bitcore = require('bitcore-lib');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const getUserId = require('../utils');


module.exports={

     Users:{
       account:(parent,args,{models},info)=>{
          return models.Accounts.findAll({where:{userId:parent.userId}});
       }
    },

    
    Query:{
        
        allUsers:(parent,args,context,info)=>{
            getUserId(context);
            return context.models.Users.findAll();
        },

        userAccount:async(parent,args,context,info)=>{
            userId = getUserId(context);
            const useraccount = await context.models.Users.findOne({where:{userId}});
            return useraccount;
        },

        //counting total users
        totalUsers:async(parent,args,{models},info)=>{
           const countUser = await models.Users.findAll();
           return countUser.length
        },

        //counting verify users
        verifyUsers:async(parent,args,{models},info)=>{
            const verifyusers = await models.Users.findAll({where:{confirm:true}});
            return verifyusers.length
        }
    },

    Mutation:{
         //signup user//
        signUp:async(parent,args,{models},info)=>{

                const user = args;

                //checking if user exist//
                const findUser = await models.Users.findOne({where:{email:user.email}});

                 if(findUser){
                     throw new Error('email is taken');
                 }

                 
                //create bitcoin address//
                const privateKey = await bitcore.PrivateKey.fromRandom(process.env.NETWORK);
                const publicKey = await bitcore.PublicKey(privateKey);
                const private = privateKey.toString();
                const address = await publicKey.toAddress().toString();

                
                user.email.toLowerCase();
                user.password = await bcrypt.hash(user.password,10);
                const createUser = await models.Users.create(user);

                const ptoken = await models.Notifications.findOne({where:{userId:createUser.userId}});
                if(!ptoken){
                    await models.Notifications.create({ushtoken:args.pushtoken,userId:createUser.userId});
                }
    
                //Sending Verification Mail//
                const code = await Math.random().toString().substring(2,9);
                sgMail.setApiKey(process.env.EMAIL_APIKEY);
                

                    const msg={
                        to: user.email,
                        from: 'verification@elowa.com',
                        subject: 'elowa verification code',
                        html:`Hey, ${fullName} your elowa verification code is ${code}`
                    }

                   
    
                await sgMail.send(msg,(err,res)=>{
                    if(err){
                        throw new Error('Invalid email address');
                    } 
                    
                });


                //save verification code//
                await models.Verification.create({vcode:code,userId:createUser.userId});

                //Creating Account//
                await models.Accounts.create({privateKey:private,addressKey:address,userId:createUser.userId});

                await models.SystemAc.create({balance:0.00,UserId:createUser.userId});
               
                const token = jwt.sign({user:_.pick(createUser,['userId','level','fullName'])},process.env.JWT_SECRET);
                return{
                    token,
                    fullName:createUser.fullName
                }
            },
            
            //user signin//
             signIn:async(parent,args,{models},info)=>{
                 const user = await models.Users.findOne({where:{email:args.email}});
                 if(!user){throw new Error('Invalid email address');}

                 const validPassword = await bcrypt.compare(args.password,user.password);
                 if(!validPassword){throw new Error('Invalid Password');}
                 
                 if(user.confirm == false){throw new Error('Please verify your account');}
                 
                 const ptoken = await models.Notifications.findOne({where:{userId:user.userId}});
                 if(ptoken){
                    await models.Notifications.update({pushtoken:args.pushtoken},{where:{userId:user.userId}});
                 }else{
                    await models.Notifications.create({pushtoken:args.pushtoken,userId:user.userId});
                 }

                 const token = jwt.sign({user:_.pick(user,['userId','level','fullName'])},process.env.JWT_SECRET);
                 return{
                     token,
                     userId:user.userId,
                     fullName:user.fullName
                 }
             },
             
             //resetting password//
             resetPassword:async(parent,{email,password},{models},info)=>{
                //check if user exits
                const user = await models.Users.findOne({where:{email}});
                if(!user){throw new Error('Invalid emaill address');}
                //change password
                const hashpassword = await bcrypt.hash(password,10);
                await models.Users.update({password:hashpassword,confirm:false},{where:{email}});
                //send verification email
                const code = await Math.random().toString().substring(2,7);
                 //sgMail.setApiKey(process.env.EMAIL_APIKEY);
                
                async function main(){

                    const msg={
                        to: user.email,
                        from: 'support@koinboxx.co.uk',
                        subject: 'verification code',
                        html: compileTamplate.render({fullName:user.fullName,code})
                    }

                    const transport = nodemailer.createTransport({
                        host:"mail.privateemail.com",
                        port:465,
                        auth:{
                            user:"support@koinboxx.co.uk",
                            pass:"Wani201910$#"
                        }
                    });

                   await transport.sendMail(msg);

                }

                main().catch(console.error);
    
                 /** await sgMail.send(msg,(err,res)=>{
                    if(err){
                        throw new Error('Invalid verification email');
                    } 
                    
                });*/
                //save verification code
                await models.Verification.create({vcode:code,userId:user.userId});
                
                //sign token
                const token = jwt.sign({user:_.pick(user,['userId','confirm','level'])},process.env.JWT_SECRET);
                return {
                    token,
                    userId:user.userId
                }
             },

             //verifying user//
             verification:async(parent,{vcode},{models},info)=>{
                 //check if code exits
                 const getCode = await models.Verification.findOne({where:{vcode}});
                 if(!getCode){throw new Error('Invalid Verification Code');}
                 
                 //change user confirm status//
                 await models.Users.update({confirm:true},{where:{userId:getCode.userId}});
                 await models.Verification.destroy({where:{userId:getCode.userId}});
                 //sign token
                 const user = await models.Users.findOne({where:{userId:getCode.userId}});
                 const token = jwt.sign({user:_.pick(user,['userId','confirm','level'])},process.env.JWT_SECRET);
                 return {
                    token
                 }

             },

             //resend verification code //
              resendCode:async(parent,args,context,info)=>{
                  const userId = getUserId(context);
                  const code = await Math.random().toString().substring(2,7);
                  const user = await context.models.Users.findOne({where:{userId}});

                  //sgMail.setApiKey(process.env.EMAIL_APIKEY);
                  
                   
                  async function main(){

                    const msg={
                        to: user.email,
                        from: 'support@koinboxx.co.uk',
                        subject: 'verification code',
                        html: compileTamplate.render({fullName:user.fullName,code})
                    }

                    const transport = nodemailer.createTransport({
                        host:"mail.privateemail.com",
                        port:465,
                        auth:{
                            user:"support@koinboxx.co.uk",
                            pass:"Wani201910$#"
                        }
                    });

                   await transport.sendMail(msg);

                }

                main().catch(console.error);
      
                  /** await sgMail.send(msg,(err,res)=>{
                      if(err){
                          throw new Error('Invalid verification email');
                      } 
                      
                  });*/

                  //save varification code//
                  await context.models.Verification.create({vcode:code,userId});

              }
            
         }

}