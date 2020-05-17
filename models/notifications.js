module.exports = (sequelize,DataType)=>{
    const Notifications = sequelize.define('Notifications',{
        pushtoken:{
            type:DataType.STRING
        }
    });
    return Notifications;
}