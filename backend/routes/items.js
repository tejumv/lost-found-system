const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const Item = require('../models/Item');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, 'item-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).single('image');

// Check file type
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images only! (jpeg, jpg, png, gif)');
  }
}

// @route   POST api/items
// @desc    Create a new lost/found item
// @access  Private
router.post('/', auth, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }

    try {
      const { title, description, category, location, date, contactInfo } = req.body;
      
      const newItem = new Item({
        title,
        description,
        category,
        location,
        date: date || Date.now(),
        image: req.file ? req.file.path : '',
        postedBy: req.user.id,
        contactInfo
      });

      const item = await newItem.save();
      res.json(item);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });
});

// @route   GET api/items
// @desc    Get all items with optional search
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, category, status } = req.query;
    let query = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    const items = await Item.find(query)
      .sort({ date: -1 })
      .populate('postedBy', ['name', 'email']);

    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/items/:id
// @desc    Get item by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('postedBy', ['name', 'email']);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/items/:id
// @desc    Update item status
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if the user is the owner of the item
    if (item.postedBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Update status
    if (status) {
      item.status = status;
      if (status === 'returned' || status === 'found') {
        item.claimedBy = req.user.id;
      }
    }

    await item.save();
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/items/:id
// @desc    Delete an item
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if the user is the owner of the item
    if (item.postedBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await item.remove();
    res.json({ message: 'Item removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
