module.exports = `

type Pack{
   id:Int
   betaId:String
   betaFullName:String
   alphaId:String
   joinDate:String!
}

type Query{
    myPack(limit:Int,cursor:Int):[Pack],
    countPack:Int
}

type Mutation{
    joinPack(email:String!):Pack
}

`;