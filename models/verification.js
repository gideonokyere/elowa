module.exports=(sequelize,DataType)=>{

    const Verification = sequelize.define('Verification',{
        vcode:{
            type:DataType.STRING,
            allowNull:false,
        }
    },{
        freezeTableName:true
    });

    return Verification;

}