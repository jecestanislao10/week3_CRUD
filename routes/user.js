const express = require('express');
const {body} = require('express-validator/check');

const router = express.Router();

const userController = require('../controllers/user');

const isAuth = require('../middleware/is-auth')
const creationAuth = require('../middleware/creation-auth')

router.post('/add-user', [
    body('email').isEmail().trim().withMessage('not a valid email'),
    body('password')
    .trim()
    .isLength({min: 5}).withMessage('password must atleast be 5 chars long')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, 'i').withMessage('password must be alphanumeric')
], creationAuth, userController.createUser);

router.get('/user/:userID', isAuth, userController.getUser);

router.patch('/update-user/:userID',
[
    body('email')
    .if((value, { req }) => req.body.email)
    .trim()
    .isEmail().trim().withMessage('not a valid email'),
    body('password')
    .if((value, { req }) => req.body.password)
    .trim()
    .isLength({min: 5}).withMessage('password must atleast be 5 chars long')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, 'i').withMessage('password must be alphanumeric')
], isAuth, userController.updateUser);

router.delete('/delete-user/:userID', isAuth, userController.removeUser);

module.exports = router;