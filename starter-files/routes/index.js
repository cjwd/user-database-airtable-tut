const express = require('express');

const router = express.Router();
const appController = require('../controllers/appController');
const userController = require('../controllers/userController');

/* GET home page. */
router.get('/', appController.getIndex);
router.get('/register', appController.getRegister);
router.get('/login', appController.getLogin);
router.get('/profile', appController.getProfile);

module.exports = router;