const express = require('express');
const router = express.Router();
const multer = require('multer');
const Income = require('../models/Income');
const auth = require('../middleware/auth');

// Multer configuration
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

/**
 * @swagger
 * /api/incomes:
 *   post:
 *     summary: Create new income record
 *     security:
 *       - bearerAuth: []
 *     tags: [Incomes]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               notes:
 *                 type: string
 *               slip:
 *                 type: string
 *                 format: binary
 */
router.post('/', auth, upload.single('slip'), async (req, res) => {
  try {
    const income = new Income({
      amount: req.body.amount,
      notes: req.body.notes,
      createdBy: req.user.userId,
      slip: req.file ? {
        path: req.file.path,
        filename: req.file.filename
      } : null
    });

    await income.save();
    res.status(201).json(income);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/incomes:
 *   get:
 *     summary: Get all income records
 *     security:
 *       - bearerAuth: []
 *     tags: [Incomes]
 */
router.get('/', auth, async (req, res) => {
  try {
    const incomes = await Income.find({ createdBy: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/incomes/{id}:
 *   get:
 *     summary: Get income by ID
 *     security:
 *       - bearerAuth: []
 *     tags: [Incomes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const income = await Income.findOne({
      _id: req.params.id,
      createdBy: req.user.userId
    });
    if (!income) {
      return res.status(404).json({ message: 'Income record not found' });
    }
    res.json(income);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/incomes/{id}:
 *   put:
 *     summary: Update income record
 *     security:
 *       - bearerAuth: []
 *     tags: [Incomes]
 */
router.put('/:id', auth, upload.single('slip'), async (req, res) => {
  try {
    const income = await Income.findOne({
      _id: req.params.id,
      createdBy: req.user.userId
    });

    if (!income) {
      return res.status(404).json({ message: 'Income record not found' });
    }

    income.amount = req.body.amount;
    income.notes = req.body.notes;

    if (req.file) {
      income.slip = {
        path: req.file.path,
        filename: req.file.filename
      };
    }

    await income.save();
    res.json(income);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/incomes/{id}:
 *   delete:
 *     summary: Delete income record
 *     security:
 *       - bearerAuth: []
 *     tags: [Incomes]
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.userId
    });

    if (!income) {
      return res.status(404).json({ message: 'Income record not found' });
    }

    res.json({ message: 'Income record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;