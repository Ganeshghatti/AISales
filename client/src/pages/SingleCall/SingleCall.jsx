import React, { useState, useEffect } from "react";
import axios from "axios";
import "./SingleCall.scss";
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
import Avatar from "@mui/joy/Avatar";
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
import { REACT_APP_BACK_URL } from "../../config/config";

export default function SingleCall() {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const admin = useSelector((state) => state.admin.admin);
  const [formData, setFormData] = useState({
    phone_number: {
      country_code: "",
      actual_phone_number: "",
    },
    prompt: "",
    transfer_number: {
      country_code: "",
      phone_number: "",
    },
    voices: [],
    voice: "",
    max_duration: "",
  });

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
        console.log(error)
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

  const handleChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const response = await axios.post(
        `${REACT_APP_BACK_URL}/admin/single-call`,
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
  return (
    <div id="SingleCall" className="SingleCall flex">
      <Panel tab="Single Call" />
      <Stack spacing={2}>{alert}</Stack>
      <div
        className="flex flex-wrap md:flex-col justify-center gap-8 w-3/4 h-full md:items-center"
        style={{ marginLeft: "1vw", marginTop: "10vh" }}
      >
        <form className="flex flex-col gap-12 w-full">
          <div className="flex justify-between">
            <FormControl className="custom-width-30">
              <InputLabel htmlFor="countryCode">Country Code</InputLabel>
              <Input
                id="countryCode"
                value={formData.phone_number.country_code}
                onChange={(e) =>
                  handleChange("phone_number", {
                    ...formData.phone_number,
                    country_code: e.target.value,
                  })
                }
              />
            </FormControl>
            <FormControl className="w-3/5">
              <InputLabel htmlFor="actualPhoneNumber">
                To Phone Number
              </InputLabel>
              <Input
                id="actualPhoneNumber"
                value={formData.phone_number.actual_phone_number}
                onChange={(e) =>
                  handleChange("phone_number", {
                    ...formData.phone_number,
                    actual_phone_number: e.target.value,
                  })
                }
              />
            </FormControl>
          </div>

          {/* Prompt */}
          <TextareaAutosize
            className="w-full border-2 border-solid border-gray2 border-opacity-50 rounded p-2"
            minRows={3}
            placeholder="Fill Prompt in Detail"
            value={formData.prompt}
            onChange={(e) => handleChange("prompt", e.target.value)}
          />

          <div className="flex justify-between">
            <FormControl className="custom-width-30">
              <InputLabel htmlFor="transferCountryCode">
                Country Code
              </InputLabel>
              <Input
                id="transferCountryCode"
                value={formData.transfer_number.country_code}
                onChange={(e) =>
                  handleChange("transfer_number", {
                    ...formData.transfer_number,
                    country_code: e.target.value,
                  })
                }
              />
            </FormControl>
            <FormControl className="w-3/5">
              <InputLabel htmlFor="transferPhoneNumber">
                Phone Number
              </InputLabel>
              <Input
                id="transferPhoneNumber"
                value={formData.transfer_number.phone_number}
                onChange={(e) =>
                  handleChange("transfer_number", {
                    ...formData.transfer_number,
                    phone_number: e.target.value,
                  })
                }
              />
            </FormControl>
          </div>

          {/* Voice Dropdown */}
          {formData.voices.length > 0 && (
            <FormControl>
              <InputLabel htmlFor="voice">Voice</InputLabel>
              <Select
                id="voice"
                value={formData.voice}
                onChange={(e) => handleChange("voice", e.target.value)}
              >
                {formData.voices.map((voice) => (
                  <MenuItem key={voice.voice_id} value={voice.voice_id}>
                    {voice.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Max Duration */}
          <TextField
            label="Max Duration (minutes)"
            type="number"
            value={formData.max_duration}
            onChange={(e) => handleChange("max_duration", e.target.value)}
          />

          {/* Submit Button */}
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
}
