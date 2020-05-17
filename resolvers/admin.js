const bcrypt = require('bcrypt');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

module.exports={

 Mutation:{
     //adding new admin
    newAdmin:async(parent,args,{models},info)=>{
        const findUser = await models.Admin.findOne({where:{userName:args.userName}});
        if(findUser){
            throw new Error('user name already taken');
        }
    
        const  password = await bcrypt.hash(args.password,10);
        const saveAdmin = await models.Admin.create({userName:args.userName,password,level:'super'})
        return saveAdmin;
    },

    //login Admin
    loginAdmin:async(parent,args,{models},info)=>{
        const user = await models.Admin.findOne({where:{userName:args.userName}});
        if(!user){
            throw new Error('Invalid UserName');
        }

        const valid = await bcrypt.compare(args.password,user.password);
        if(!valid){
            throw new Error('Invalid Password');
        }

        const token = await jwt.sign({user:_.pick(user,['level','id'])},process.env.JWT_SECRET,{expiresIn:'1d'});
        return {
            token,
            id:user.id
        };
    }

 }


}

