const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
// const path = require('path');

const router = express.Router();

// Define the schema and model
const resoursesSchema = new mongoose.Schema({
  title: String,
  description: String,
  link: String,
  image: String,
});

const Resourses = mongoose.model('Resourses', resoursesSchema);

// Configure multer to store images in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Serve static files
const app = express();
app.use(express.json());

// Route to add a resource item
router.post('/add-resourses-item', upload.single('image'), async (req, res) => {
  const { title, description, link } = req.body;
  const image = req.file.buffer.toString('base64'); // Convert buffer to Base64

  const resourses = new Resourses({
    title,
    description,
    link,
    image,
  });

  try {
    const newResourses = await resourses.save();
    res.status(201).json(newResourses);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Route to get resource items
router.get('/resourses-items', async (req, res) => {
  try {
    const resourses = await Resourses.find();
    res.json(resourses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to delete a resource item
router.post('/delete-resourses-item', async (req, res) => {
  const { itemId } = req.body;
  try {
    const deletedItem = await Resourses.findByIdAndDelete(itemId);
    if (!deletedItem) {
      return res.status(404).json({ message: 'Resource item not found' });
    }
    res.json({ message: 'Resource item deleted successfully', deletedItem });
  } catch (error) {
    console.error('Error deleting resource item:', error);
    res.status(500).json({ message: 'Failed to delete resource item' });
  }
});

module.exports = router;
