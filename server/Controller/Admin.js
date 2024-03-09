const adminModel = require("../Model/Admin");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const axios = require("axios");
const moment = require("moment");
const { sendErrorEmail } = require("../utils/Errormail");
const uuid = require("uuid");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", "api", ".env") });

const app = express();
app.use(cors());
app.use(bodyParser.json());

const apiKey = process.env.BLAND_API_KEY;
console.log(apiKey);

exports.AdminLogin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        error: "enter a valid email",
      });
    }
    const admin = await adminModel.findOne({ email: email });

    if (!admin) {
      return res.status(401).json({
        error: "wrong email or password",
      });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(400).json({
        error: "wrong email or password",
      });
    }

    const token = jwt.sign(
      { userId: admin._id, email: admin.email },
      process.env.ADMINJWTSECRET
    );

    res.status(200).json({
      email: admin.email,
      token: token,
    });
  } catch (error) {
    sendErrorEmail(email, "Someone tried to Login to Admin Panel");
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.GetAllVoices = async (req, res, next) => {
  //send all available voices to frontend in the below format
  res.status(200).json({
    voices: [
      {
        voice_id: 2,
        name: "jen-english",
        is_custom: false,
        reduce_latency: true,
      },
      {
        voice_id: 0,
        name: "matt",
        is_custom: false,
        reduce_latency: true,
      },
    ],
  });
};
exports.SingleCall = async (req, res, next) => {
  console.log("Received data:", req.body);
  // Parse the form values89
  const { phone_number, prompt, transfer_number, voice, max_duration } =
    req.body;
  const { country_code: countryCode, actual_phone_number: phoneNumber } =
    phone_number;
  const {
    country_code: transferCountryCode,
    phone_number: transferPhoneNumber,
  } = transfer_number;
  const data = {
    phone_number: countryCode + phoneNumber,
    task: prompt,
    voice_id: 1,
    reduce_latency: false,
    transfer_phone_number: transferCountryCode + transferPhoneNumber,
  };

  // Dispatch the phone call
  axios
    .post("https://api.bland.ai/call", data, {
      headers: {
        authorization: apiKey,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      const { status } = response.data;

      if (status) {
        res
          .status(200)
          .send({ message: "Phone call dispatched", status: "success" });
      }
    })
    .catch((error) => {
      console.error("Error:", error);

      res
        .status(400)
        .send({ message: "Error dispatching phone call", status: "error" });
    });
};
