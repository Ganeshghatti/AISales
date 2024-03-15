import React, { useState, useEffect } from "react";
import axios from "axios";
import "./BulkCall.scss";
import { useParams } from "react-router-dom";
import Panel from "../../components/Panel/Panel";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Spinnerf from "../../components/Spinnerf";
import CancelIcon from "@mui/icons-material/Cancel";
import Checkbox from "@mui/material/Checkbox";
import { Radio, RadioGroup, FormControlLabel } from "@mui/material";
import LinearProgress from "@mui/joy/LinearProgress";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Avatar from "@mui/joy/Avatar";
import AccordionGroup from "@mui/joy/AccordionGroup";
import { REACT_APP_BACK_URL } from "../../config/config";
import {
  TextField,
  TextareaAutosize,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Input,
  FormHelperText,
} from "@mui/material";
import Papa from "papaparse";

export default function BulkCall() {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    csvFile: null,
    phone_numbers: [
      {
        country_code: "",
        actual_phone_number: "",
      },
    ],
    prompt: "",
    voices: [],
    voice: "",
    transfer_number: {
      country_code: "",
      phone_number: "",
    },
    from_number: {
      country_code: "",
      phone_number: "",
    },
    max_duration: 0,
  });
  const admin = useSelector((state) => state.admin.admin);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    parseCsv(file);
    setFormData({
      ...formData,
      csvFile: file,
    });
  };

  const parseCsv = (file) => {
    Papa.parse(file, {
      header: true,
      complete: (result) => {
        const phone_numbers = result.data
          .map((row) => {
            return {
              country_code: row.country_code,
              actual_phone_number: row.actual_phone_number,
            };
          })
          .filter(
            (number) => number.country_code && number.actual_phone_number
          );
        console.log(phone_numbers);
        setFormData({
          ...formData,
          phone_numbers,
        });
      },
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (admin.email.length > 0) {
          setLoading(true);
          const response = await axios.get(
            `${REACT_APP_BACK_URL}/admin/get-all-voices`,
            {
              headers: {
                Authorization: `Bearer ${admin.token}`,
              },
            }
          );
          setFormData((prevData) => ({
            ...prevData,
            voices: response.data.voices,
          }));
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
        if (error.response && error.response.status === 401) {
          setLoading(false);
          return navigate(`/`);
        }
        setAlert(
          <Alert
            style={{ position: "fixed", bottom: "3%", left: "2%", zIndex: 999 }}
            variant="filled"
            severity="error"
          >
            {error.response.data.error}
          </Alert>
        );
        setTimeout(() => setAlert(null), 5000);
        setLoading(false);
      }
    };

    fetchData();
  }, [admin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log(formData)
      const response = await axios.post(
        `${REACT_APP_BACK_URL}/admin/bulk-call`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${admin.token}`,
          },
        }
      );
      setAlert(
        <Alert
          style={{ position: "fixed", bottom: "3%", left: "2%", zIndex: 999 }}
          variant="filled"
          severity="success"
        >
          <p>Call Sent Successfully</p>
        </Alert>
      );
      setTimeout(() => setAlert(null), 5000);
      setLoading(false);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setLoading(false);
        return navigate(`/`);
      }
      setAlert(
        <Alert
          style={{ position: "fixed", bottom: "3%", left: "2%", zIndex: 999 }}
          variant="filled"
          severity="error"
        >
          {error.response.data.error}
        </Alert>
      );
      setTimeout(() => setAlert(null), 5000);
      setLoading(false);
    }
  };
  const handleInputChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  return (
    <div id="BulkCall" className="BulkCall flex">
      <Panel tab="Bulk Call" />
      <Stack spacing={2}>{alert}</Stack>
      <div
        className="flex flex-wrap md:flex-col justify-center gap-8 w-3/4 h-full md:items-center"
        style={{ marginLeft: "1vw", marginTop: "10vh" }}
      >
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="csvFile">Upload CSV File:</label>
            <input
              type="file"
              id="csvFile"
              accept=".csv"
              onChange={handleFileChange}
            />
          </div>
          <div>
            <label htmlFor="prompt">Prompt:</label>
            <TextareaAutosize
              className="w-full border-2 border-solid border-gray2 border-opacity-50 rounded p-2"
              minRows={3}
              id="prompt"
              placeholder="Fill Prompt in Detail"
              value={formData.prompt}
              onChange={(e) => handleInputChange("prompt", e.target.value)}
            />
          </div>
          <FormControl className="w-3/5">
            <InputLabel htmlFor="transferPhoneNumber">Phone Number</InputLabel>
            <Input
              id="transferPhoneNumber"
              value={formData.transfer_number.phone_number}
              onChange={(e) =>
                handleInputChange("transfer_number", {
                  ...formData.transfer_number,
                  phone_number: e.target.value,
                })
              }
            />
          </FormControl>
          <FormControl className="w-3/5">
            <InputLabel htmlFor="fromPhoneNumber">Phone Number</InputLabel>
            <Input
              id="fromPhoneNumber"
              value={formData.from_number.phone_number}
              onChange={(e) =>
                handleInputChange("from_number", {
                  ...formData.from_number,
                  phone_number: e.target.value,
                })
              }
            />
          </FormControl>

          {formData.voices.length > 0 && (
            <FormControl>
              <InputLabel htmlFor="voice">Voice</InputLabel>
              <Select
                id="voice"
                value={formData.voice}
                onChange={(e) => handleInputChange("voice", e.target.value)}
              >
                {formData.voices.map((voice) => (
                  <MenuItem key={voice.voice_id} value={voice.voice_id}>
                    {voice.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <div>
            <label htmlFor="max_duration">Max Duration:</label>
            <TextField
              label="Max Duration (minutes)"
              type="number"
              id="max_duration"
              value={formData.max_duration}
              onChange={(e) =>
                handleInputChange("max_duration", e.target.value)
              }
            />
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}
