const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuthAsync } = require('../middleware/requireAuth');

router.post('/', userController.createUser);
router.get('/:id', requireAuthAsync, userController.getUserById);
router.post('/login', userController.loginUser);
router.delete('/me/token', requireAuthAsync, userController.logoutUser);

module.exports = router;
