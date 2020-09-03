const { gql } = require('apollo-server-express');

const userSchema = require('./user');
// import messageSchema from './message';

const linkSchema = gql`
  type Query {
    hello: String
  }
`;

module.exports = [linkSchema, userSchema];
