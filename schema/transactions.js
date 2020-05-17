module.exports=`

type Transactions{
    id:Int!
    amount:Float!
    trxtype:String!
    createdOn:String!
    createdAt:String!
    userId:String!
}

type Query{
    myTrx(limit:Int,cursor:Int):[Transactions],
    todayDeposits:[Transactions]
}

type Mutation{
    payOut(id:Int):String,
    cancelPay(id:Int):String
}

`;