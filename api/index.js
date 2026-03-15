const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI);

// Your routes
app.use("/api/users", require("./routes/users"));
// ... other routes

// ❌ Remove this if you have it:
// app.listen(5000, () => console.log("Server running"))

module.exports = app; // ✅ This is what Vercel needs