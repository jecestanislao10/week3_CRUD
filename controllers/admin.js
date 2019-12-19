const User = require('../models/user');
const bcrypt = require('bcryptjs');

const {validationResult} = require('express-validator/check');

exports.getUsers = async (req, res, next) => {
    if(req.permissionLevel!== '1')
        {
        const error = new Error ('operation not allowed');
        error.statusCode = 405;
        next(error);
        }
    const users = await User.find();
    res.status(200).json({message: "sucessfully fetched users", users: users});
};

exports.removeUser = async (req, res, next) => {
   
    const userID = req.params.userID;

    try {

        if (req.permissionLevel !== '1')
    {
            const error = new Error ('operation not allowed');
            error.statusCode = 405;
            throw error; 
    }

        if(!userID){
            const error = new Error('no input provided');
            error.statusCode = 422;
            throw error;
        }

        const user = await User.findById(userID);

        if (!user){
            const error = new Error ('User not found');
            error.statusCode = 404;
            throw error;
        }

        const result = await User.findByIdAndRemove(userID);

        res.status(200).json({message: "user deleted", user: result});

    } catch(err) {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}


