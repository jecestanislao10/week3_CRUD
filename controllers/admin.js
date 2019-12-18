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
    res.status(200).json({permissionLevel: req.permissionLevel,message: "sucessfully fetched users", users: users});
};


