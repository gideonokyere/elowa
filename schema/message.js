module.exports = `
  type message{
      id:Int,
      title:String,
      content:String
  }

  type Query{
      allMessage:[message]
  },

  type Mutation{
      sendMessage(title:String!,content:String!):message
  }

`;