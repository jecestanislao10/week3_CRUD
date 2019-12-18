const User = require('../models/user');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {validationResult} = ('express-validator/check');

exports.logIn = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    try {

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

    const token = jwt.sign(
        {
          email: user.email,
          userId: user._id.toString(),
          permissionLevel: user.permissionLevel
        },
        'supersecretkeynijerico',
        { expiresIn: '1h' }
      );

    res.status(201).json({message: "successfully logged in", user_id : user._id, token: token });

    } catch(err) {
        
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err); 

    }


};