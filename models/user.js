const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema ({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    fname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
    permissionLevel: {
        type: String,
        required: true,
        enum: ["1", "0"]
    }
});

module.exports = mongoose.model('User', userSchema);