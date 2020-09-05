const jwt = require('jsonwebtoken');
const { combineResolvers } = require('graphql-resolvers');
// const { AuthenticationError, UserInputError } = require ('apollo-server');

const { isAuthenticated } = require('../middleware/authorization');

const createToken = async (user, secret = 'config.cfg.jwtSecretKey', expiresIn = 100000) => {
  const { id, email, name } = user;
  return await jwt.sign({ id, email, name }, secret, {
    expiresIn,
  });
};

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
    user: async (parent, { id }, { dbConnection }) => {
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
    },
    // me: async (parent, args, { models, me }) => {
    //   if (!me) {
    //     return null;
    //   }

    //   return await models.User.findById(me.id);
    // },
    hello: () => {
      return 'fkjhfjkhf'
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
      { login, password },
      { models, secret },
    ) => {
      const user = await models.User.findByLogin(login);
      if (!user) {
        throw new UserInputError(
          'No user found with this login credentials.',
        );
      }

      const isValid = await user.validatePassword(password);

      if (!isValid) {
        throw new AuthenticationError('Invalid password.');
      }

      return { token: createToken(user, secret, '30m') };
    },

    // updateUser: combineResolvers(
    //   isAuthenticated,
    //   async (parent, { username }, { models, me }) => {
    //     const user = await models.User.findById(me.id);
    //     return await user.update({ username });
    //   },
    // ),

    // deleteUser: combineResolvers(
    //   isAdmin,
    //   async (parent, { id }, { models }) => {
    //     return await models.User.destroy({
    //       where: { id },
    //     });
    //   },
    // ),
  },

  User: {
    extendProp: async (parent, args, { dbConnection }) => {
      return `Overwrite existing key or call new functions for getting this key.
       Also you can use parent reslved value for fetching other details${parent.name}`
    },
  },
};
