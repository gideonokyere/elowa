module.exports=(sequelize,DataType)=>{
    const DepositQuery = sequelize.define('DepositQuery',{
        amount:{
            type:DataType.FLOAT,
            allowNull:false
        },
        createdOn:{
            type:DataType.DATEONLY,
            allowNull:false
        },
        address:{
            type:DataType.STRING,
            allowNull:false
        },
        status:{
            type:DataType.STRING,
            allowNull:false,
            defaultValue:'pendding'
        }
    },{freezeTableName:true});
    return DepositQuery;
}