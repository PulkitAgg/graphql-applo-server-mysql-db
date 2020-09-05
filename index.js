const cors = require('cors');
const path = require('path');
const  http = require('http');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression')
const {
  ApolloServer,
  AuthenticationError
} = require('apollo-server-express');

const schema = require('./lib/schema');
const resolvers = require( './lib/resolvers');
const dbConnection = require('./lib/config/mysql').mysqlConnection();

const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  introspection: true,
  playground: true,
  context: async ({ req, connection }) => {
    if (connection) {
      return {
        dbConnection,
      };
    }
    if (req) {
      return {
        dbConnection,
        secret: process.env.SECRET,
      };
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
