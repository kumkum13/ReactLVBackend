const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const multer = require('multer');
const { Readable } = require('stream');

const carouselSchema = new mongoose.Schema({
  imageData: { type: String, required: true },
  label: { type: String, required: true },
  text: { type: String, required: true },
});

const CarouselItem = mongoose.model('CarouselItem', carouselSchema);

// Middleware to handle file upload
const storage = multer.memoryStorage(); // Use memory storage to get file buffer
const upload = multer({ storage });

// Route to add new carousel item
router.post('/add-carousel-item', upload.single('image'), async (req, res) => {
  const { label, text } = req.body;
  const imageData = req.file.buffer.toString('base64'); // Convert buffer to base64 string
  const newItem = new CarouselItem({ imageData, label, text });
  
  try {
    await newItem.save();
    res.json(newItem);
  } catch (error) {
    console.error('Error adding carousel item:', error);
    res.status(500).json({ message: 'Failed to add carousel item' });
  }
});

// Route to get all carousel items
router.get('/carousel-items', async (req, res) => {
  try {
    const items = await CarouselItem.find();
    res.json(items);
  } catch (error) {
    console.error('Error fetching carousel items:', error);
    res.status(500).json({ message: 'Failed to fetch carousel items' });
  }
});

// Route to delete carousel item by ID
router.post('/delete-carousel-item', async (req, res) => {
  const { itemId } = req.body;
  try {
    const deletedItem = await CarouselItem.findByIdAndDelete(itemId);
    if (!deletedItem) {
      return res.status(404).json({ message: 'Carousel item not found' });
    }
    res.json({ message: 'Carousel item deleted successfully', deletedItem });
  } catch (error) {
    console.error('Error deleting carousel item:', error);
    res.status(500).json({ message: 'Failed to delete carousel item' });
  }
});

module.exports = router;
