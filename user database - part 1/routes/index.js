const express = require('express');

const router = express.Router();
const appController = require('../controllers/appController');
const userController = require('../controllers/userController');

/* GET home page. */
router.get('/', appController.getIndex);
router.get('/register', appController.getRegister);
router.get('/login', appController.getLogin);
router.get('/profile', appController.getProfile);

router.post('/user/add', userController.addUser, userController.storePassword);
router.post(
  '/user/auth',
  userController.authenticate,
  appController.getProfile
);

module.exports = router;
