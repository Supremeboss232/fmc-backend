// server.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 5000;

// ES module __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // serve HTML frontend

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));


// Mongoose schema & model
const LeadSchema = new mongoose.Schema({
  name: String,
  email: String,
  created: { type: Date, default: Date.now }
});
const Lead = mongoose.model("Lead", LeadSchema);

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/api/open-account", async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: "Missing fields" });

    const lead = await Lead.create({ name, email });
    console.log("💾 Lead saved:", lead);

    // Send confirmation email
    try {
      await transporter.sendMail({
        from: `"FMC Trading" <${process.env.MAIL_USER}>`,
        to: email,
        subject: "Welcome to FMC Demo Account",
        text: `Hi ${name}, your demo account is being set up!`
      });
      console.log("📨 Email sent to:", email);
    } catch (emailError) {
      console.error("📧 Email failed:", emailError.message);
    }

    res.json({ status: "ok", lead });
  } catch (err) {
    console.error("💥 Server error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
//allow access from anywhere,
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });    
// app.options("*", (req, res) => {
//   res.header("Access-Control-Allow-Methods", "GET, PATCH, PUT, POST, DELETE, OPTIONS");
//   res.send();
// });
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, "public"))); // serve HTML frontend
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "index.html"));
// });

