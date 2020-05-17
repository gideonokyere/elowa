module.exports = `

type Users{
    userId:String!
    fullName:String!,
    email:String!,
    confirm:String!
    level:String!,
    account:[Account]
}

type AuthPayload{
    token:String!,
    userId:String,
    fullName:String
}

type Query{
    allUsers:[Users],
    userAccount:Users,
    totalUsers:Int,
    verifyUsers:Int
}

type Mutation{
    signUp(fullName:String!,email:String!,password:String!,pushtoken:String):AuthPayload,
    signIn(email:String!,password:String!,pushtoken:String):AuthPayload,
    resetPassword(email:String!,password:String!):AuthPayload,
    verification(vcode:String!):AuthPayload,
    resendCode:Int
}

`