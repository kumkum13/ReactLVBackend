const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Define the schema and model
const carouselSchema = new mongoose.Schema({
  image: { type: String }, // Change to store base64 image
  label: { type: String },
  text: { type: String},
});

const CarouselItem = mongoose.model('CarouselItem', carouselSchema);

// Route to add new carousel item with base64 image
router.post('/add-carousel-item', async (req, res) => {
  const { label, text} = req.body;
  const image = req.file.buffer.toString('base64');
  
  const newItem = new CarouselItem({
    image, // Store base64 image
    label,
    text,
  });

  try {
    const newCrousel = await newItem.save();
    res.status(201).json(newCrousel);
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
