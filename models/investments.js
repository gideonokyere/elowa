module.exports=(sequelize,DataType)=>{

    const Investments = sequelize.define('Investments',{

        package:{
            type:DataType.STRING,
            allowNull:false
        },

        amount:{
           type:DataType.FLOAT,
           allowNull:false
        },

        interest:{
            type:DataType.FLOAT,
            allowNull:false
        },

        total:{
            type:DataType.FLOAT,
            allowNull:false
        },

        startDate:{
          type:DataType.DATEONLY,
          allowNull:false,
          validate:{
            isDate:{
                args:true,
                msg:"Date only"
            }
          }
        },

        endDate:{
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
            defaultValue:'active'
        },
        totalI:{
            type:DataType.FLOAT,
            allowNull:false
        },
        rate:{
            type:DataType.FLOAT,
            defaultValue:false
        },
        weeks:{
            type:DataType.STRING,
            allowNull:false
        }
       
    });

    Investments.associate=(models)=>{
       
        Investments.hasMany(models.WeeklyPay,{
            foreignKey:'InvestmentId',
            onUpdate:'cascade',
            onDelete:'cascade'
        })

    }

    return Investments;

}