const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const multer = require('multer');


// Define the schema and model
const languageSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String, // Store base64 string
});

const Language = mongoose.model('Language', languageSchema);


const storage = multer.memoryStorage();
const upload = multer({ storage });
// Middleware to parse JSON bodies
const app = express();
app.use(express.json());

// Route to add a language item with base64 image
router.post('/add-lang-item', upload.single('image'), async (req, res) => {
  const { title, description } = req.body;
  const image = req.file.buffer.toString('base64');
  const language = new Language({
    title,
    description,
    image // Store base64 image
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