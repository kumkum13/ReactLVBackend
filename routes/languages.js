const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const router = express.Router();

const languageSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
});

const Language = mongoose.model('Language', languageSchema);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'languages_img/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// Route to add a language item
router.post('/add-lang-item', upload.single('image'), async (req, res) => {
  const { title, description } = req.body;
  const image = `https://reactlvbackend.onrender.com/languages_img/${req.file.filename}`;

  const language = new Language({
    title,
    description,
    image,
  });

  try {
    const newLanguage = await language.save();
    res.status(201).json(newLanguage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Route to get all language items
router.get('/lang-items', async (req, res) => {
  try {
    const languages = await Language.find();
    res.json(languages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to delete a language item
router.post('/delete-lang-item', async (req, res) => {
  const { itemId } = req.body;
  try {
    const deletedItem = await Language.findByIdAndDelete(itemId);
    if (!deletedItem) {
      return res.status(404).json({ message: 'Language item not found' });
    }
    res.json({ message: 'Language item deleted successfully', deletedItem });
  } catch (error) {
    console.error('Error deleting Language item:', error);
    res.status(500).json({ message: 'Failed to delete Language item' });
  }
});

module.exports = router;
