module.exports =`

type Vault{
    id:Int!,
    name:String!,
    address:String!
}

type VaultPayLoad{
    name:String!
    addressKey:String!
    btc:String!,
    usd:String!
}

type Query{
    allVaults:[Vault],
    vaultBalance(id:String!):VaultPayLoad
}

type Mutation{
    newVault(name:String!):Vault,
    fundsToVault(from:String!,to:String!,amount:Float!):String
}

`