const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

<<<<<<< HEAD
router.post('/register', registerUser);
=======
router.post('/', registerUser);
>>>>>>> 4e5da2af4f5cf6e7fa9f096f210818b6bc3b9656
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, upload, updateUserProfile);

module.exports = router;
