module.exports=(sequelize,DataType)=>{

    const Transactions = sequelize.define('Transactions',{
        
       amount:{
           type:DataType.FLOAT,
           allowNull:false
       },
       trxtype:{
           type:DataType.STRING,
           allowNull:false
       },
       createdOn:{
           type:DataType.DATEONLY,
           allowNull:false
       }

    },{freezeTableName:true});

  return Transactions;

}