module.exports=(sequelize,DataType)=>{
    const Testimonia = sequelize.define('Testimonia',{
        fullName:{
            type:DataType.STRING,
            allowNull:false
        },
        content:{
            type:DataType.STRING,
            allowNull:false
        },
        date:{
            type:DataType.DATEONLY,
            allowNull:false
        }
    })
    return Testimonia
}