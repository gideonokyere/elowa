module.exports=(sequelize,DataType)=>{
    const Pack = sequelize.define('Pack',{
        betaId:{
            type:DataType.STRING,
        },
        betaFullName:DataType.STRING,
        joinDate:DataType.DATEONLY,
        payAlpha:{
            type:DataType.BOOLEAN,
            defaultValue:false
        }
    },{
        freezeTableName:true
    });

    return Pack;
}