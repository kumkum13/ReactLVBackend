const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Define the schema and model
const languageSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String, // Store base64 string
});

const Language = mongoose.model('Language', languageSchema);

// Middleware to parse JSON bodies
const app = express();
app.use(express.json());

// Route to add a language item with base64 image
router.post('/add-lang-item', async (req, res) => {
  const { title, description, imageBase64 } = req.body;

  // Validate base64 string
  if (!imageBase64 || !/^data:image\/[a-z]+;base64,.+/.test(imageBase64)) {
    return res.status(400).json({ message: 'Invalid image format' });
  }

  const language = new Language({
    title,
    description,
    image: imageBase64, // Store base64 image
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
