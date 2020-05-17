module.exports=(sequelize,DataType)=>{

    const WeeklyPay = sequelize.define('WeeklyPay',{

        amount:{
            type:DataType.FLOAT,
            allowNull:false,
            validate:{
                isFloat:{
                    args:true,
                    msg:"require filed"
                }
            }
        },

        date:{
            type:DataType.DATEONLY,
            allowNull:false,
            validate:{
                isDate:{
                    args:true,
                    msg:"Date only"
                }
            }
        },
        status:{
            type:DataType.STRING,
            allowNull:false,
            defaultValue:'Not Paid'
        }

    },{freezeTableName:true});

 return WeeklyPay;

}