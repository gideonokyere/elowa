module.exports=(sequelize,DataType)=>{
    const SystemAc = sequelize.define('SystemAc',{
        balance:{
            type:DataType.FLOAT,
            allowNull:false
        }
    },{freezeTableName:true});

    return SystemAc;

}