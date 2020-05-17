const {Expo} = require('expo-server-sdk');
const adminId = require('../adminUtils');
const expo = new Expo();
module.exports={
    Query:{
        allMessage:(parent,arge,context,info)=>{
            adminId(context);
            return context.models.Message.findAll({order:[['createdAt','ASC']]});
        }
    },

    Mutation:{
        sendMessage:async(parent,args,context,info)=>{
          const pushtokens = await context.models.Notifications.findAll();
          if(!pushtokens) return;
          
          let messages=[];
          for(let tokens of pushtokens){
             
            if(tokens.dataValues.pushtoken){

                messages.push({
                    to:tokens.dataValues.pushtoken,
                    sound:'default',
                    body:args.title,
                    data:{messagetosend:args.content}
                });

            }
              
          }



          //send message //
          await expo.sendPushNotificationsAsync(messages);

          saveMessage = await context.models.Message.create(args);
          return saveMessage

        }
    }
}