const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');

const isAuth = require('../middleware/is-auth');

router.post('/login', authController.logIn);

router.post('/refresh-token', isAuth, authController.refreshToken);


module.exports = router;