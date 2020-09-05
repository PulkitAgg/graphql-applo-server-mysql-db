const jwt = require('jsonwebtoken');
const { combineResolvers } = require('graphql-resolvers');
const { UserInputError } = require('apollo-server');

const { isAuthenticated, createToken } = require('../middleware/authorization');

module.exports = {
  Query: {
    users: combineResolvers(
      isAuthenticated,
      async (parent, args, { dbConnection }) => {
        let queryString = `SELECT * FROM users LIMIT 10`;
        return new Promise((resolve, reject) => {
          dbConnection.query(queryString, (err, result) => {
            if (err) {
              console.log('err in users', err);
              reject(err);
            }
            console.log('result--->', result)
            resolve(result);
          })
        })
      },
    ),
    user: combineResolvers(
      isAuthenticated,
      async (parent, { id }, { dbConnection }) => {
        let queryString = `SELECT * FROM users WHERE Id = ?`;
        return new Promise((resolve, reject) => {
          dbConnection.query(queryString, [id], (err, result) => {
            if (err) {
              console.log('err in user', err);
              reject(err);
            }
            console.log('result--->', result)
            resolve(result[0]);
          })
        })
      }
    ),
    hello: () => {
      return 'Hello world!'
    }
  },

  Mutation: {
    signUp: async (
      parent,
      { name, email, password },
      { dbConnection, secret },
    ) => {
      let queryString = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
      return new Promise((resolve, reject) => {
        dbConnection.query(queryString, [name, email, password], (err, result) => {
          if (err) {
            console.log('err in signUp', err);
            reject(err);
          }
          console.log('result--->', result)
          resolve({ token: createToken({ name, email, id: result.insertId }, secret, '30m') });
        })
      })
    },

    signIn: async (
      parent,
      { email, password },
      { dbConnection, secret },
    ) => {
      let queryString = `SELECT * FROM users WHERE email = ? AND password = ?`;
      return new Promise((resolve, reject) => {
        dbConnection.query(queryString, [email, password], (err, result) => {
          if (err) {
            console.log('err in user', err);
            reject(err);
          }
          console.log('result--->', result)
          if (result.length === 0) {
            reject(new UserInputError(
              'No user found with this login credentials.',
            ));
            // if (!isValid) {
            //   throw new AuthenticationError('Invalid password.');
            // }
          } else {
            let { name, email, Id } = result[0];
            resolve({ token: createToken({ name, email, id: Id }, secret, '30m') });
          }
        })
      })
    },
  },

  User: {
    extendProp: async (parent, args, { dbConnection }) => {
      return `Overwrite existing key or call new functions for getting this key.
       Also you can use parent reslved value for fetching other details${parent.name}`
    },
  },
};
