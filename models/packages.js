module.exports=(sequelize,DataType)=>{

    const Packages = sequelize.define('Packages',{

        name:{
            type:DataType.STRING,
            allowNull:false,
        },

        startAmount:{
            type:DataType.FLOAT,
            allowNull:false,
            validate:{
               isFloat:{
                   args:true,
                   msg:"float values only"
               }
           }
        },

        weeks:{
            type:DataType.INTEGER,
            allowNull:false,
            validate:{
                isNumeric:{
                    args:true,
                    msg:"Numeric values Only"
                }
            }
        },

        interest:{
            type:DataType.FLOAT,
             allowNull:false,
             validate:{
                isFloat:{
                    args:true,
                    msg:"Float values Only"
                }
            }
        },

        describtion:{
            type:DataType.TEXT,
            allowNull:false 
        }

    });

    return Packages;

}