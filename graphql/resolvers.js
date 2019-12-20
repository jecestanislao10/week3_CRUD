const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

module.exports = {
    login: async function ({email, password}, req) {

        const errors = [];

        if (!email){
            errors.push({message: "missing email"});
        }

        if (!password){
            errors.push({message: "missing password"});
        }

        if (errors.length > 0) {
            const error = new Error('Invalid input');
            error.data = errors;
            error.code = 422;
            throw error;
        }

        const emailExist = await User.findOne({email: email});
        
        if (!emailExist){
            const error = new Error ("wrong email/password");
            error.code = 401;
            throw error;
        }

        const pwmatches = await bcrypt.compare(password, emailExist.password);

        if(!pwmatches){
            const error = new Error ("wrong email/password");
            error.code = 401;
            throw error;
        }

        const refreshToken = jwt.sign(
            {},
            'supersecretkeynijerico',
            { expiresIn: '1d' }
          );
    
        const credentials = {
            email: emailExist.email,
            userId: emailExist._id.toString(),
            permissionLevel: emailExist.permissionLevel,
            refreshToken: refreshToken
        }
    
        const token = jwt.sign(
            credentials,
            'supersecretkeynijerico',
            { expiresIn: '1h' }
          );
    
        return {message: "logged in successfully", accessToken: token, refreshToken: refreshToken, _id: emailExist._id};

    },
    getUsers: async function ({inputData}, req) {
        
        if(req.isAuth === false){
            const error = new Error('not Authenticated');
            error.code = 401;
            throw error;
        }

        if(req.permissionLevel !== "1"){
            const error = new Error('Operation not allowed');
            error.code = 401;
            throw error;
        }

        const users = await User.find();

        return {message: "Sucessfully fetched all users", 
        users: users.map(user =>
            {
                return{
                ...user._doc,
                _id: user._id.toString(),
                email: user.email,
                password: user.password,
                fname: user.fname,
                lname: user.lname,
                permissionLevel: user.permissionLevel
                };
            })
        }
    },
    getUser: async function({userId}, req){

        if(req.isAuth === false){
            const error = new Error('not Authenticated');
            error.code = 401;
            throw error;
        }

        const user = await User.findById(userId);
        return ({
        message: "Sucessfully fetched user",
        _id: user._id.toString(),
        email: user.email,
        password: user.password,
        fname: user.fname,
        lname: user.lname,
        permissionLevel: user.permissionLevel
    })
    },
    createUser: async function ({inputData}, req) {
        const email = inputData.email;
        const password = inputData.password;
        const fname = inputData.fname;
        const lname = inputData.lname;
        const permissionLevel = inputData.permissionLevel;

        const errors = [];

        if(!validator.isEmail(email)){
           errors.push({message: "Invalid email"});
        }

        // don't really get it but this works the opposite way 
        if(validator.isAlphanumeric(password, ['en-US'])){
            errors.push({message: "password must be alphanumeric"});
        }

        if(validator.isEmpty(password) || 
            !validator.isLength(password, { min:5 })){
            errors.push({message: "password must be atleast 5 char long"});
        }

        if (errors.length > 0) {
            const error = new Error('Invalid input');
            error.data = errors;
            error.code = 422;
            throw error;
        }

        const emailExist = await User.findOne({email: email});
        
        if(emailExist){
            const error = new Error('email already exists');
            error.code = 409;
            throw error;
        }

        const user = new User ({
            email: email,
            password: password,
            fname: fname,
            lname: lname,
            permissionLevel: permissionLevel
        });

        await user.save();
        return ({
            message: "Successfully created user",
            _id: user._id.toString(),
            email: user.email,
            password: user.password,
            fname: user.fname,
            lname: user.lname,
            permissionLevel: user.permissionLevel
        })
    },
    updateUser: async function({updateData}, req){

        if(req.isAuth === false){
            const error = new Error('not Authenticated');
            error.code = 401;
            throw error;
        }

        const errors = [];
         
        if(updateData.email){

            if(!validator.isEmail(updateData.email)){
                errors.push({message: "Invalid email"});
             }
        }

            if(updateData.password){
         // don't really get it but this works the opposite way 
            if(validator.isAlphanumeric(updateData.password, ['en-US'])){
                errors.push({message: "password must be alphanumeric"});
            }
 
            if(validator.isEmpty(updateData.password) || 
                !validator.isLength(updateData.password, { min:5 })){
                errors.push({message: "password must be atleast 5 char long"});
            }
        }

        if (errors.length > 0) {
            const error = new Error('Invalid input');
            error.data = errors;
            error.code = 422;
            throw error;
        }

        const user = await User.findById(updateData._id);

        if (!user){
            const error = new Error('no user found');
            error.code = 401;
            throw error;
        }

        let updatedInfo = {...user._doc};

        for (let key in updateData) {
            if (user[key] !== updateData[key]){
            updatedInfo[key] = updateData[key];
            }
        }

        if(updateData.email){
        const emailExists = await User.findOne({email: updateData.email});
        if(emailExists){
            const error = new Error("email already exists");
            error.code = 409;
            throw error;}
        }

        await User.updateOne({_id: updateData._id}, updatedInfo);

        const newData = await User.findById(updateData._id);

        return ({
            message: "successfully updated user",
            _id: newData._id.toString(),
            email: newData.email,
            password: newData.password,
            fname: newData.fname,
            lname: newData.lname,
            permissionLevel: newData.permissionLevel
        })

    },
    deleteUser: async function ({userId}, req) {

        if(req.isAuth === false){
            const error = new Error('not Authenticated');
            error.code = 401;
            throw error;
        }
        
        const user = await User.findById(userId);

        if (!user){
            const error = new Error('no user found');
            error.code = 401;
            throw error;
        }

        const deleted = await User.findByIdAndRemove(userId);

        return ({
            message: "successfully deleted user",
            _id: deleted._id.toString(),
            email: deleted.email,
            password: deleted.password,
            fname: deleted.fname,
            lname: deleted.lname,
            permissionLevel: deleted.permissionLevel
        })
    },
    refreshToken: async function({refreshToken}, req){
        
        if(req.isAuth === false){
            const error = new Error('not Authenticated');
            error.code = 401;
            throw error;
        }

        if (refreshToken !== req.refreshToken){
            const error = new Error('operation not allowed');
            error.code = 401;
            throw error;
        }

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
    
        return {message: "token refreshed", accessToken: token, refreshToken: refreshToken, _id: user._id};


    }
}