  const express = require('express');
  const multer = require('multer');
  const mongoose = require('mongoose');

  const router = express.Router();

  const resoursesSchema = new mongoose.Schema({
    title: String,
    description: String,
    link: String,
    image: String,

  });

  const Resourses = mongoose.model('Resourses', resoursesSchema);

  const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'Resourses_img/');
      },
      filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
      },
    });

    const upload = multer({ storage });

    // Route to add a language item
    router.post('/add-resourses-item', upload.single('image'), async (req, res) => {
      const { title, description, link } = req.body;
      const image = `http://localhost:5000/Resourses_img/${req.file.filename}`;
       console.log(image);
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
    
  
    router.get('/resourses-items', async (req, res) => {
      try {
        const resourses = await Resourses.find();
        res.json(resourses);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

    router.post('/delete-resourses-item', async (req, res) => {
      const  {itemId}  = req.body;
      // console.log(itemId)
      try {
        const deletedItem = await Resourses.findByIdAndDelete(itemId);
        if (!deletedItem) {
          return res.status(404).json({ message: 'Resourse item not found' });
        }
        res.json({ message: 'Resourse item deleted successfully', deletedItem });
      } catch (error) {
        console.error('Error deleting Resourse item:', error);
        res.status(500).json({ message: 'Failed to delete Resourse item' });
      }
    });
    
  module.exports = router;
