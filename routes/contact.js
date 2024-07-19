const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

const contactSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  contactNumber: { type: String, required: true },
  country: { type: String, required: true },
  selectedLanguage: { type: String, required: true },
  selectrole: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Contact = mongoose.model("Contact", contactSchema);

router.post("/submit", async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        contactNumber,
        country,
        selectedLanguage,
        selectrole
      } = req.body;
  
      // Create a new Contact document
      const newContact = new Contact({
        firstName,
        lastName,
        email,
        contactNumber,
        country,
        selectedLanguage,
        selectrole,
      });
  
      
      await newContact.save();
  
      res.status(201).json({ message: "Contact form data saved successfully" });
    } catch (error) {
      console.error("Error saving contact form data:", error);
      res.status(500).json({ message: "Failed to save contact form data" });
    }
  });

  router.get("/contacts", async (req, res) => {
    try {
      const contacts = await Contact.find();
      res.status(200).json(contacts);
    } catch (error) {
      console.error("Error fetching contact data:", error);
      res.status(500).json({ message: "Failed to fetch contact data" });
    }
  });
  
  
  module.exports = router;

