const { gql } = require('apollo-server-express');

const userSchema = require('./user');

const linkSchema = gql`
  type Query {
    hello: String
  }
`;

module.exports = [linkSchema, userSchema];
