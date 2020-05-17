module.exports = `

type InvestMents{
    id:Int!
    package:String!
    amount:Float!
    rate:Float!
    weeks:Int!
    totalI:Float!
    interest:Float!
    total:Float
    startDate:String!
    endDate:String!
    status:String!
    PayWeekly:[PayWeekly]
    User:Users
}

type Query{
    myInvest(limit:Int,cursor:Int):[InvestMents],
    dueInvest(limit:Int,cursor:Int):[InvestMents],
    investDetail(id:Int!):InvestMents,
    countActive:Int,
    countDue:Int
    totalActive:Int,
    totalDue:Int,
    dueToday:Int,
    totalInvestAmount:Float,
    totalInterestAmount:Float
    activeInvestments:[InvestMents]
}

type Mutation{
    newInvestment(packageName:String!,amount:Float!,rate:Float!,weeks:Int!):InvestMents
}

`