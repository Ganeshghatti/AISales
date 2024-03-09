const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDatabase = require("./config/database");
const adminRoutes = require("./routes/Admin");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "api", ".env") });
const app = express();

// Configure CORS middleware
const corsOptions = {
  origin: "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // enable set cookie
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(bodyParser.json());

// Routes
app.use(adminRoutes);

// Connect to database
connectDatabase();

module.exports = app;
