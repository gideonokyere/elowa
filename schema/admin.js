module.exports = `

type Admin{
    id:Int,
    userName:String,
    level:String
}

type adminLoad{
    token:String!,
    id:String!
}

type Mutation{
    newAdmin(userName:String!,password:String,level:String):Admin,
    loginAdmin(userName:String!,password:String!):adminLoad
}

`;