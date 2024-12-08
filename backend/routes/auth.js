const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
* @swagger
* /api/auth/create-first-user:
*   post:
*     summary: Create first user
*     tags: [Auth]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - username
*               - password
*             properties:
*               username:
*                 type: string
*               password:
*                 type: string
*     responses:
*       201:
*         description: User created successfully
*/
router.post('/create-first-user', async (req, res) => {
 try {
   const { username, password } = req.body;

   // Check if user already exists
   const existingUser = await User.findOne({ username });
   if (existingUser) {
     return res.status(400).json({ message: 'User already exists' });
   }

   // Create new user
   const user = new User({
     username,
     password // Will be hashed by the User model middleware
   });

   await user.save();
   res.status(201).json({ message: 'User created successfully' });
 } catch (error) {
   res.status(500).json({ message: error.message });
 }
});

/**
* @swagger
* /api/auth/login:
*   post:
*     summary: Login user
*     tags: [Auth]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - username
*               - password
*             properties:
*               username:
*                 type: string
*               password:
*                 type: string
*     responses:
*       200:
*         description: Login successful
*/
router.post('/login', async (req, res) => {
 try {
   const { username, password } = req.body;

   // Find user
   const user = await User.findOne({ username });
   if (!user) {
     return res.status(401).json({ message: 'Invalid credentials' });
   }

   // Check password
   const isMatch = await bcrypt.compare(password, user.password);
   if (!isMatch) {
     return res.status(401).json({ message: 'Invalid credentials' });
   }

   // Generate JWT token
   const token = jwt.sign(
     { userId: user._id },
     process.env.JWT_SECRET,
     { expiresIn: '1d' }
   );

   res.json({ token });
 } catch (error) {
   res.status(500).json({ message: error.message });
 }
});

/**
* @swagger
* /api/auth/change-password:
*   post:
*     summary: Change user password
*     tags: [Auth]
*     security:
*       - bearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - currentPassword
*               - newPassword
*             properties:
*               currentPassword:
*                 type: string
*               newPassword:
*                 type: string
*     responses:
*       200:
*         description: Password changed successfully
*/
router.post('/change-password', async (req, res) => {
 try {
   const { currentPassword, newPassword } = req.body;

   // Find user
   const user = await User.findById(req.user.userId);
   if (!user) {
     return res.status(404).json({ message: 'User not found' });
   }

   // Verify current password
   const isMatch = await bcrypt.compare(currentPassword, user.password);
   if (!isMatch) {
     return res.status(401).json({ message: 'Current password is incorrect' });
   }

   // Update password
   user.password = newPassword;
   await user.save();

   res.json({ message: 'Password changed successfully' });
 } catch (error) {
   res.status(500).json({ message: error.message });
 }
});

module.exports = router;