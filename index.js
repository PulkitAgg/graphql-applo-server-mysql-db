const cors = require('cors');
const http = require('http');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression')
const {
  ApolloServer,
} = require('apollo-server-express');
const dbConnection = require('./lib/config/mysql').mysqlConnection();

const schema = require('./lib/schema');
const resolvers = require('./lib/resolvers');
const { checkToken } = require('./lib/middleware/authorization');


const app = express();
app.use(cors());
app.use(helmet());
app.use(compression());

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  introspection: true,
  playground: true,
  debug: true, // false for production
  formatError: error => {
    const message = error.message ? error.message : '';
    return {
      message,
      ...error,
    }
  },
  context: async ({ req, connection }) => {
    if (connection) {
      // handling subscription
      return {
        dbConnection,
      };
    }
    if (req) {
      return checkToken(req).then(tokenResult => {
        return {
          dbConnection,
          tokenResult,
          tokenVerify: true
        };
      }).catch(err => {
        return {
          dbConnection,
          err,
          tokenVerify: false
        };
      })
    }
  },
});

server.applyMiddleware({ app, path: '/graphql' });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);


const port = process.env.PORT || 8000;

httpServer.listen({ port }, () => {
  console.log(`Apollo Server on http://localhost:${port}/graphql`);
});
