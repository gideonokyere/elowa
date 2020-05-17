module.exports=(sequelize,DataType)=>{
    const Users = sequelize.define('Users',{
        
        userId:{
            type:DataType.UUID,
            primaryKey:true,
            defaultValue:DataType.UUIDV4,
        },

        fullName:{
            type:DataType.STRING,
            allowNull:false
        },

        email:{
            type:DataType.STRING,
            unique:true,
            allowNull:false,
            validate:{
                isEmail:{
                    args:true,
                    msg:"please provide valide email"
                }
            }
        },

        password:{
            type:DataType.STRING,
            allowNull:false,
        },

        level:{
          type:DataType.STRING,
           allowNull:false,
          defaultValue:'CUSTOMER'
        },

        confirm:{
            type:DataType.STRING,
            allowNull:false,
            defaultValue:false
        },

        createdAt:{
           type:DataType.DATEONLY
        },

    });

    Users.associate=(models)=>{

        Users.hasOne(models.Accounts,{
            foreignKey:'userId',
            onUpdate:'cascade',
            onDelete:'cascade'
        });

        Users.hasMany(models.Transactions,{
            foreignKey:'userId',
            onUpdate:'cascade',
            onDelete:'cascade'
        });

        Users.hasMany(models.Investments,{
            foreignKey:'userId',
            onUpdate:'cascade',
            onDelete:'cascade'
        });

        Users.hasMany(models.WeeklyPay,{
            foreignKey:'userId',
            onUpdate:'cascade',
            onDelete:'cascade'
        });

        Users.hasOne(models.Verification,{
            foreignKey:'userId',
            onUpdate:'cascade',
            onDelete:'cascade'
        });

        Users.hasOne(models.SystemAc,{
            foreignKey:'UserId',
            onUpdate:'cascade',
            onDelete:'cascade'
        });

        Users.hasMany(models.DepositQuery,{
            foreignKey:'UserId',
            onUpdate:'cascade',
            onDelete:'cascade'
        });

        Users.hasOne(models.Notifications,{
            foreignKey:'userId',
            onUpdate:'cascade',
            onDelete:'cascade'
        });

        Users.hasMany(models.Pack,{
            foreignKey:'alphaId',
            onUpdate:'cascade',
            onDelete:'cascade'
        });

        Users.hasMany(models.WithdrawFunds,{
            foreignKey:'userId',
            onUpdate:'cascade',
            onDelete:'cascade'
        });

    }
    
    return Users;

}