module.exports = `

type Packages{
    id:Int!,
    name:String!
    startAmount:String!,
    weeks:String!,
    interest:String!,
    describtion:String!
}

type packagePayLoad{
    id:Int!,
    name:String!
    startAmount:String!,
    weeks:String!,
    interest:String!,
    describtion:String!
    btc:String!
}

type Query{
    allPackages:[Packages],
    packageDetail(id:Int!):packagePayLoad,
    packageDetails(id:String!):packagePayLoad
}

type Mutation{
    newPackage(name:String!,startAmount:String!,weeks:String!,interest:String!,describtion:String!):Packages,
    editPackage(name:String!,startAmount:String!,weeks:String!,interest:String!,describtion:String!,id:Int!):[Int!],
    deletePackage(id:Int):Int
}

`