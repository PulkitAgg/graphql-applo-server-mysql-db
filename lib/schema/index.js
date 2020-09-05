const { gql } = require('apollo-server-express');

const userSchema = require('./user');

const linkSchema = gql`
  type Query {
    hello: String
  }

  type Mutation {
    _: Boolean
  }
`;

module.exports = [linkSchema, userSchema];
