module.exports = (sequelize,DataType)=>{
    const Message = sequelize.define('Message',{
        title:{
            type:DataType.STRING,
            allowNull:false
        },
        content:{
            type:DataType.STRING,
            allowNull:false
        }
    })
    return Message;
}