module.exports=(sequelize,DataType)=>{

    const Vault = sequelize.define('Vault',{

        name:{
            type:DataType.STRING,
            allowNull:false
        },

        privateKey:{
            type:DataType.STRING,
            allowNull:false
        },

        address:{
            type:DataType.STRING,
            allowNull:false
        }

    },{freezeTableName:true});

    return Vault;

}