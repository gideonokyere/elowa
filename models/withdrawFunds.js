module.exports=(sequelize,DataType)=>{
    const WithdrawFunds = sequelize.define('WithdrawFunds',{
        fullName:{
            type:DataType.STRING,
            allowNull:false
        },
        amount:{
            type:DataType.FLOAT,
            allowNull:false
        },
        date:{
            type:DataType.DATEONLY,
            allowNull:false
        },
        status:{
            type:DataType.STRING,
            allowNull:false,
            defaultValue:'pendding'
        }
    },{freezeTableName:true});
    return WithdrawFunds;
}