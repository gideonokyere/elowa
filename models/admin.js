module.exports=(sequelize,DataType)=>{
   const Admin = sequelize.define('Admin',{
       userName:{
           type:DataType.STRING,
           allowNull:false
       },
       password:{
           type:DataType.STRING,
           allowNull:false
       },
       level:{
           type:DataType.STRING,
           allowNull:false
       }
   });
   
   return Admin;
}