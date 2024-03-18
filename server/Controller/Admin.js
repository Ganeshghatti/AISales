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
 
	const {country_code,phone_number, prompt, transfer_number, voice, max_duration} =
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

exports.BulkCall = async (req, res, next) => {
	try {
			console.log("Request body:", req.body); // Debug statement to fetch details from the frontend
			const { prompt, transfer_number, voice, max_duration, phone_numbers } = req.body;
			const { country_code: transferCountryCode, phone_number: transferPhoneNumber } = transfer_number;

			// Check if phone_numbers array exists
			if (!phone_numbers || phone_numbers.length === 0) {
					console.log("Phone numbers are missing"); // Debug statement
					return res.status(400).json({ message: "Phone numbers are missing", status: "error" });
			}

			// Maintain a set to keep track of processed phone numbers
			const processedPhoneNumbers = new Set();

			// Split phone numbers into batches of 10
			const batches = [];
			for (let i = 0; i < phone_numbers.length; i += 10) {
					batches.push(phone_numbers.slice(i, i + 10));
			}

			// Iterate through each batch of phone numbers and dispatch calls
			for (const batch of batches) {
					console.log("Processing batch of phone numbers:", batch); // Debug statement
					const calls = batch.map(phoneNumber => {
							// Check if the phone number has already been processed
							if (processedPhoneNumbers.has(phoneNumber.actual_phone_number)) {
									console.log("Phone number already processed:", phoneNumber.actual_phone_number); // Debug statement
									return null; // Skip this phone number
							}
							console.log("Processing phone number:", phoneNumber.actual_phone_number); // Debug statement
							processedPhoneNumbers.add(phoneNumber.actual_phone_number); // Add the phone number to the processed set
							return {
									phone_number: phoneNumber.country_code + phoneNumber.actual_phone_number, // Add country code to the phone number
									task: prompt,
									voice_id: voice,
									reduce_latency: false,
									transfer_phone_number: transferCountryCode + transferPhoneNumber,
							};
					}).filter(call => call !== null); // Remove null entries (skipped phone numbers)

					// Dispatch the phone calls for the current batch
					console.log("Dispatching phone calls with data:", calls); // Debug statement
					await Promise.all(calls.map(call => {
							return axios.post("https://api.bland.ai/v1/calls", call, {
									headers: {
											authorization: apiKey, // Assuming apiKey is defined somewhere in your code
											"Content-Type": "application/json",
									},
							});
					}));
			}

			res.status(200).json({ message: "Bulk calls dispatched", status: "success" });
	} catch (error) {
			console.error("Error:", error);
			res.status(400).json({ message: "Error dispatching bulk calls", status: "error" });
	}
};


exports.GetCallLogs = async (req, res) => {
    try {
        const apiKey = process.env.BLAND_API_KEY; // Ensure your API key is stored securely
        console.log("Fetching call logs with API Key:", apiKey); // Debug statement for logging

        const response = await axios.get('https://api.bland.ai/v1/calls', {
            headers: { 'Authorization': apiKey }
        });

        console.log("Received response from API:", response.status); // Debug statement for logging response status

        if (response.status === 200) {
            // Optionally, log the response data or part of it for debugging
            console.log("Call logs data:", response.data); // Be mindful of logging sensitive information

            // Directly pass the response data to the frontend
            res.status(200).json(response.data);
        } else {
            // Handle unexpected responses
            res.status(response.status).json({ message: "Failed to fetch call logs" });
        }
    } catch (error) {
        console.error("Error fetching call logs:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
