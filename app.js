const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const userRoutes = require('./routes/user')
const adminRoutes = require('./routes/admin')
const authRoutes = require('./routes/auth');

const app = express();

const DB_URI = "mongodb+srv://jestanislao:Bloomingglory10@cluster0-yvu13.mongodb.net/newdb";


app.use(bodyParser.json());

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
app.use("/admin",adminRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
  });

mongoose.connect(DB_URI).then(result => {
    console.log('JEC_LOG: Connected to the Database');
    app.listen(3000);
}).catch(err => console.log(err));