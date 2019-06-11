const express = require('express');

const router = express.Router();
const appController = require('../controllers/appController');
const userController = require('../controllers/userController');

/* GET home page. */
router.get('/', appController.getIndex);
router.get('/register', appController.getRegister);
router.get('/login', appController.getLogin);
router.get('/logout', userController.logout);
router.get('/profile', userController.isLoggedIn, appController.getProfile);
router.get('/forgot-password', appController.getForgetPassword);
router.get('/login/resetlink/:token', appController.getResetPassword);

router.post(
  '/user/add',
  userController.addUser,
  userController.storePassword,
  appController.getLogin
);
router.post('/user/auth', userController.authenticate);
router.post(
  '/user/forgot',
  userController.addToken,
  userController.sendPasswordResetEmail
);
router.post(
  '/user/reset',
  userController.confirmToken,
  userController.storePassword,
  userController.sendConfirmResetEmail
);

module.exports = router;
