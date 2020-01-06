const User = require('../models/user');
const bcrypt = require('bcryptjs');

const {validationResult} = require('express-validator/check');

exports.createUser = async (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;
    const fname = req.body.fname;
    const lname = req.body.lname;
    let permissionLevel = "0";

    try{
 
        if (req.body.permissionLevel && req.permissionLevel !== "1"){
            const error = new Error('Not allowed to assign permission level');
            error.statusCode = 405;
            throw error;
        }

        else if(req.permissionLevel === "1")
        {
            permissionLevel = req.body.permissionLevel;
        }

        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed.');
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        
        const emailExist = await User.findOne({email: email});

        if (emailExist) {
            const error = new Error ("e-mail already exist");
            error.statusCode = 202;
            throw error; 
        }

        const hashedpw = await bcrypt.hash(password, 12);

        const user = new User ({
            email: email,
            password: hashedpw,
            fname: fname,
            lname: lname,
            permissionLevel: permissionLevel
        })

        const result = await user.save();
        
        res.status(201).json({message: 'user has been created', result: result});

    } catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }

}

exports.getUser = async (req, res, next) => {
        const userID = req.params.userID;       
        try {

            if(!userID){
                const error = new Error('No input provided');
                error.statusCode = 422;
                throw(error);
            }

            const user = await User.findById(userID);


            if(!user){
                const error = new Error('No user fetched');
                error.statusCode = 404;
                throw(error);
            }

            let fetchedUser = {};

            if (req.permissionLevel == "1"){
                fetchedUser = user;
            }else{
                fetchedUser.fname = user.fname;
                fetchedUser.lname = user.lname;
            }

            res.status(200).json({message: 'User fetched', 
            user: fetchedUser});

        } catch(err) {
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        }
};

exports.updateUser = async (req, res, next) => {

    const userID = req.params.userID;

    
    try {
    const errors = validationResult(req);
        
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    // block clients from updating permission level
    if(req.body.permissionLevel && req.permissionLevel === "0"){
        const error = new Error ('not allowed to change permission level');
        error.statusCode = 405;
        throw error;
    }

    //block clients from updating info that is not their's
    if (userID !== req.userId && req.permissionLevel === "0"){
        const error = new Error('operation not allowed');
        error.statusCode = 403;
        throw error; 
    }


    const user = await User.findById(userID);

    if (!user){
        const error = new Error ("User not found");
        error.statusCode = 404;
        throw error;
    }


    let updatedInfo = {...user._doc};

    for (let key in req.body) {
        if (user[key] !== req.body[key])
        updatedInfo[key] = req.body[key];
    }

    if(req.body.email){
    const emailExists = await User.findOne({email: req.body.email});
        if(emailExists){
            const error = new Error("email already exists");
            error.statusCode = 409;
            throw error;
        }
    }

    const updatedUser = await User.updateOne({_id: userID}, updatedInfo);

    const update = await User.findById(userID);

    let fetchedUser = {};

    fetchedUser.email = update.email;
    fetchedUser.fname = update.fname;
    fetchedUser.lname = update.lname;
    fetchedUser.password = update.password;

    if(req.permissionLevel === "1")
    {
        fetchedUser.permissionLevel = update.permissionLevel;
    }
    

    res.status(200).json({message: "sucessfully updated user", user: fetchedUser});


    } catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
};