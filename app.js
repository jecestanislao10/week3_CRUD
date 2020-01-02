const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const compression = require('compression');

const userRoutes = require('./routes/user')
const adminRoutes = require('./routes/admin')
const authRoutes = require('./routes/auth');

const graphqlAuth = require('./middleware/graphql-auth')

const graphqlHttp = require('express-graphql');

const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');

const app = express();

// const DB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-yvu13.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;

const DB_URI = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-shard-00-00-yvu13.mongodb.net:27017,cluster0-shard-00-01-yvu13.mongodb.net:27017,cluster0-shard-00-02-yvu13.mongodb.net:27017/${process.env.MONGO_DEFAULT_DATABASE}?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority`;


app.use(bodyParser.json());

app.use(compression());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });

app.use(authRoutes);
app.use(userRoutes);
app.use(adminRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
  });

app.use(graphqlAuth);

app.use(
    '/graphql',
    graphqlHttp({
      schema: graphqlSchema,
      rootValue: graphqlResolver,
      graphiql: true,
      formatError(err) {
        if (!err.originalError) {
          return err;
        }
        const data = err.originalError.data;
        const message = err.message || 'An error occurred.';
        const code = err.originalError.code || 500;
        return { message: message, status: code, data: data };
      }
    })
  );

app.use((req, res, next) => {
  res.send("<h1><a href = https://explore.postman.com/templates/4631/week3-collection>Postman Collections link</a></h1>");
})
mongoose.connect(DB_URI).then(result => {
    console.log('JEC_LOG: Connected to the Database');
    app.listen(process.env.PORT || 3000);
}).catch(err => console.log(err));