module.exports=(sequelize,DataType)=>{
    const InterestToPay = sequelize.define('InterestToPay',{
        totalInvest:{
            type:DataType.FLOAT,
            allowNull:false
        },
        totalToPay:{
            type:DataType.FLOAT,
            allowNull:false
        }
    });
    return InterestToPay;
}