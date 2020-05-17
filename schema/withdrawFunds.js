module.exports=`

type WithdrawFunds{
    id:Int!
    fullName:String!
    amount:Float!
    date:String!
    status:String!
    userId:String!
}

type Query{
    penddingFunds:[WithdrawFunds],
    countPenddin:Int,
    withdrawHistory(limit:Int,offset:Int):[WithdrawFunds]
}

type Mutation{
    requestFunds(amount:Float):WithdrawFunds
}

`;