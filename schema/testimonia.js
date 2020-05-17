module.exports = `
 
 type Testimonia{
     id:Int!
     fullName:String!
     content:String!
     date:String!
 }

 type Query{
     allTestimonia(limit:Int,offset:Int):[Testimonia]
 }

 type Mutation{
     addTestimonia(content:String):Testimonia
     adminPost(fullName:String!,content:String!,date:String!):Testimonia
 }

`;