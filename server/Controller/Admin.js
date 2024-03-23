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
const Papa = require("papaparse");

dotenv.config({ path: path.join(__dirname, "..", "api", ".env") });

const app = express();
app.use(cors());
app.use(bodyParser.json());

const apiKey = process.env.BLAND_API_KEY;

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
  const {
    phone_number,
    prompt,
    transfer_number,
    voice,
    from_number,
    max_duration,
  } = req.body;

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

  axios
    .post("https://api.bland.ai/v1/calls", data, {
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
          .json({ message: "Phone call dispatched", status: "success" });
      }
    })
    .catch((error) => {
      console.log("Error:", error);
      res
        .status(400)
        .json({ message: "Error dispatching phone call", status: "error" });
    });
};

exports.BulkCall = async (req, res, next) => {
  try {
    const {
      prompt,
      transfer_number,
      voice,
      max_duration,
      phone_numbers,
      from_number,
    } = req.body;
    const {
      country_code: transferCountryCode,
      phone_number: transferPhoneNumber,
    } = transfer_number;

    if (!phone_numbers || phone_numbers.length === 0) {
      console.log("Phone numbers are missing"); // Debug statement
      return res
        .status(400)
        .json({ message: "Phone numbers are missing", status: "error" });
    }

    const processedPhoneNumbers = new Set();

    const batches = [];
    for (let i = 0; i < phone_numbers.length; i += 10) {
      batches.push(phone_numbers.slice(i, i + 10));
    }

    // Iterate through each batch of phone numbers and dispatch calls
    for (const batch of batches) {
      console.log("Processing batch of phone numbers:", batch); // Debug statement
      const calls = batch
        .map((phoneNumber) => {
          // Check if the phone number has already been processed
          if (processedPhoneNumbers.has(phoneNumber.actual_phone_number)) {
            console.log(
              "Phone number already processed:",
              phoneNumber.actual_phone_number
            ); // Debug statement
            return null; // Skip this phone number
          }
          console.log(
            "Processing phone number:",
            phoneNumber.actual_phone_number
          ); // Debug statement
          processedPhoneNumbers.add(phoneNumber.actual_phone_number); // Add the phone number to the processed set
          return {
            phone_number:
              "+" + phoneNumber.country_code + phoneNumber.actual_phone_number, // Add country code to the phone number
            task: prompt,
            voice_id: voice,
            reduce_latency: false,
            transfer_phone_number: transferCountryCode + transferPhoneNumber,
          };
        })
        .filter((call) => call !== null); // Remove null entries (skipped phone numbers)

      // Dispatch the phone calls for the current batch
      console.log("Dispatching phone calls with data:", calls); // Debug statement
      await Promise.all(
        calls.map((call) => {
          return axios.post("https://api.bland.ai/v1/calls", call, {
            headers: {
              authorization: apiKey, // Assuming apiKey is defined somewhere in your code
              "Content-Type": "application/json",
            },
          });
        })
      );
    }

    res
      .status(200)
      .json({ message: "Bulk calls dispatched", status: "success" });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(400)
      .json({ message: "Error dispatching bulk calls", status: "error" });
  }
};

exports.GetCallLogs = async (req, res) => {
	try {
	  console.log("Fetching call logs with API Key:", apiKey);
	  const options = { method: "GET", headers: { authorization: apiKey } };
	  const response = await axios.get("https://api.bland.ai/v1/calls", options);
  
	  console.log("Received response from API:", response.status);
  
	  if (response.status === 200) {
		console.log("Call logs data:", response.data);
		res.status(200).json(response.data);
	  } else {
		res.status(response.status).json({ message: "Failed to fetch call logs" });
	  }
	} catch (error) {
	  console.error("Error fetching call logs:", error);
	  res.status(500).json({ message: "Internal server error" });
	}
};


exports.GetTranscript = async (req, res) => {
  const { callId } = req.params;
  if (!callId) {
    return res.status(400).json({ message: "Call ID is missing" });
  }
  try {
    const options = { method: "GET", headers: { authorization: apiKey } };
    const response = await axios.get(`https://api.bland.ai/v1/calls/${callId}`, options);

    if (response.status === 200) {
      console.log(response.data);
      const transcripts = response.data.transcripts;
      if (transcripts && transcripts.length > 0) {
        const concatenatedTranscript = response.data.concatenated_transcript;
        console.log("Transcripts:");
        transcripts.forEach(transcript => {
          console.log(transcript);
        });
        console.log("Concatenated Transcript:");
        console.log(concatenatedTranscript);
        return res.status(200).json({ transcripts, concatenatedTranscript });
      } else {
        console.log("Transcripts not found");
        return res.status(404).json({ message: "Transcripts not found" });
      }
    } else {
      console.error("Failed to fetch transcript");
      return res.status(response.status).json({ message: "Failed to fetch transcript" });
    }
  } catch (error) {
    console.error("Error fetching transcript:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};





