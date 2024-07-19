const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const StudentModel = require("./models/Students");
const carouselRoutes = require("./routes/Crousel");
const Languages = require("./routes/languages");
const Resources = require("./routes/resourses");
const Contact = require("./routes/contact");
const path = require("path");
require("dotenv").config();
require("./config/passport");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const otps = new Map();
const otps1 = new Map();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL, // your email
    pass: process.env.EMAIL_PASSWORD, // your email password
  },
});

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose
  .connect(process.env.MongoDB_String)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

  
// Routes
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);
app.use("/crousel", carouselRoutes);
app.use("/lang", Languages);
app.use("/resourses", Resources);
app.use("/contact", Contact);

const staticImagePathcrousel = path.join(__dirname, 'crousel_img');
app.use('/crousel_img', express.static(staticImagePathcrousel));

const staticImagePathlanguage = path.join(__dirname, 'languages_img');
app.use('/languages_img', express.static(staticImagePathlanguage));

const staticImagePathresourses = path.join(__dirname, 'resourses_img');
app.use('/resourses_img', express.static(staticImagePathresourses));


// Login route  

app.post("/Login", (req, res) => {
  const { email, password } = req.body;
  StudentModel.findOne({ email: email })
    .then((user) => {
      if (user) {
        if (user.password === password) {
          res.json({ status: "Success", user });
        } else if (!user.password) {
          res.json({ status: "No Password" });
        } else {
          res.json({ status: "The Password is Incorrect" });
        }
      } else {
        res.json({ status: "No Record Exist" });
      }
    })
    .catch((err) => res.status(500).json({ error: err.message }));
});

const updateUserRole = async (email, role) => {
  try {
    const user = await StudentModel.findOne({ email });
    if (user) {
      user.role = role;
      await user.save();
      return true;
    }
    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
};

app.post('/updateUserRole', async (req, res) => {
  const { email, role } = req.body;
  if (!email || !role) {
    return res.status(400).json({ success: false, message: 'Email and role are required' });
  }

  const isUpdated = await updateUserRole(email, role);

  if (isUpdated) {
   
    return res.json({ success: true});
  } else {
    return res.status(404).json({ success: false, message: 'Given Email is not Registered' });
  }
});

// Register route
app.post("/register", async (req, res) => {
  const { name, email, phone,country, password } = req.body;
  try {
    const existingUser = await StudentModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: "Error in mail", message: "Email Already Exists" });
    }

    const newUser = new StudentModel({ name, email, phone,country, password });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.post('/sendotp', async (req, res) => {
  const { email } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  otps1.set(email, otp);
  // console.log(`OTP for ${email}: ${otp}`)

  // Configure nodemailer
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
 
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Your Registration OTP",
    text: `Hello! Welcome to the LinguaVid Family.
Your OTP for Registration is: ${otp}.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Error sending OTP', error });
  }
});

app.post('/verifyotp1', (req, res) => {
  const { email, otp } = req.body;

  const storedOtp1 = otps1.get(email);
  // console.log(otp);
  // console.log(storedOtp1);
  if (storedOtp1 !== otp) {
    return res.status(400).json({ status: 'Invalid OTP', message: 'Invalid OTP' });
  }

  return res.status(200).json({ status: 'Valid OTP', message: 'Valid OTP' });
});

app.post("/forgetpassword", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await StudentModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: "Error in mail", message: "User not found" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    otps.set(email, otp);

    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Your Password Reset OTP",
      text: `Hello! Welcome to the LinguaVid Family.
Your OTP for password reset is: ${otp}.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ status: "Error", message: "Failed to send email. Please try again." });
      }
      res.json({ status: "Success", message: "OTP sent to email" });
    });
  } catch (error) {
    res.status(500).json({ status: "Error", message: "Server error. Please try again." });
  }
});

app.post("/verifyotp", (req, res) => {
  const { email, otp, newPassword } = req.body;

  const storedOtp = otps.get(email);
  if (storedOtp !== otp) {
    return res.status(400).json({ status: "Invalid OTP", message: "Invalid OTP" });
  }

  StudentModel.updateOne({ email }, { $set: { password: newPassword } })
    .then((data) => {
      if (data.modifiedCount === 1) {
        otps.delete(email);
        res.json({ status: "Success", message: "Password updated successfully" });
      } else {
        res.status(500).json({ status: "Error", message: "Password update failed. Please try again." });
      }
    })
    .catch((error) => {
      res.status(500).json({ status: "Error", message: "Server error. Please try again.", error });
    });
});


// Logout route
app.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res
        .status(500)
        .json({ status: "Error logging out", error: err.message });
    }
    res.json({ status: "Logged out successfully" });
  });
});
  
// Current user route
app.get("/current_user", async (req, res) => {
  if (req.isAuthenticated()) {
    let result = await StudentModel.findOne({ email: req.user.email });
    console.log("User Info: ", result);
    res.json(req.user);
  } else {
    res.json(null);
  } 
});

app.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/");
  }
);





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
