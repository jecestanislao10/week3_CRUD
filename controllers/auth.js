const User = require('../models/user');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const tokenlist = {};

exports.logIn = async (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;

    try {

    if (!email){
        const error = new Error('no email provided');
        error.statusCode = 404;
        throw error;
    }

    if (!password){
        const error = new Error('no password provided');
        error.statusCode = 422;
        throw error;
    }

    const user = await User.findOne({email: email});

    if (!user) {
        const error = new Error('wrong username');
        error.statusCode = 404;
        throw error;
    }

    const isequal = await bcrypt.compare(password, user.password);

    if (!isequal)
    {
        const error = new Error('Wrong password');
        error.statuseCode = 404;
        throw error;
    }
    
    const refreshToken = jwt.sign(
        {},
        'supersecretkeynijerico',
        { expiresIn: '1d' }
      );

    const credentials = {
        email: user.email,
        userId: user._id.toString(),
        permissionLevel: user.permissionLevel,
        refreshToken: refreshToken
    }

      const token = jwt.sign(
        credentials,
        'supersecretkeynijerico',
        { expiresIn: '1h' }
      );

    const response = {
        "message": "Sucessfully Logged in",
        "token": token,
        "refreshToken": refreshToken
    }
        
    res.status(200).json(response);

    } catch(err) {
        
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err); 

    }


};

exports.refreshToken = async (req, res, next) => {

    const refreshToken = req.body.refreshToken;

    try{

        if(!refreshToken)
        {
            const error = new Error('no refresh token provided');
            error.statusCode(404);
            throw error;
        }
    
        if (refreshToken == req.refreshToken)
        {
            const user = await User.findById(req.userId);

            const credentials = {
                email: user.email,
                userId: user._id.toString(),
                permissionLevel: user.permissionLevel,
                refreshToken: refreshToken
            }
        
              const token = jwt.sign(
                credentials,
                'supersecretkeynijerico',
                { expiresIn: '1h' }
              );

              res.status(201).json({message: "Token refreshed", NewToken: token});

        }else {
            const error = new Error ('refresh token is not valid');
            error.statusCode = 404;
            throw error;
        }
        

    } catch(err) {
        
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err); 

    }

}