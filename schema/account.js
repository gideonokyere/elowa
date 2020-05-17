module.exports = `


type Account{
    accountId:String!,
    addressKey:String!,
    userId:String!
},

type AccountPayLoad{
    sysac:Float!
    btc:Float!
    usd:Float!
}

type BtcRate{
    GBP:String!,
    USD:String!,
    EUR:String!
}

type Query{
    allAccounts:[Account],
    accountBalance:AccountPayLoad,
    getBtcPrice:BtcRate,
    userAddress:Account,
    penddingDeposit:Int
    rawTrans:String
}

type Mutation{
    sendCoins(to:String!,amount:Float!):String,
    makeDeposit(amount:Float!):String,
    fundsToUser(email:String!,amount:Float!):String
}

`