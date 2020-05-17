module.exports=(sequelize,DataType)=>{
    const Accounts = sequelize.define('Accounts',{

       accountId:{
         type:DataType.UUID,
         primaryKey:true,
         defaultValue:DataType.UUIDV4
       },

        privateKey:{
            type:DataType.STRING,
            allowNull:false,
            unique:true
        },

        addressKey:{
            type:DataType.STRING,
            allowNull:false,
            unique:true
        }
    });

    return Accounts;

}