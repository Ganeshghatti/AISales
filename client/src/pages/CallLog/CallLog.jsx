import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CallLog.scss";
import { useParams, useNavigate } from "react-router-dom";
import Panel from "../../components/Panel/Panel";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useSelector } from "react-redux";
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

export default function CallLog() {
  const [callLog, setcallLog] = useState([]);
  const admin = useSelector((state) => state.admin.admin);

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
          setcallLog(response.data)
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
  return (
    <div id="CallLog" className="CallLog flex">
      <Panel />
      <div className="flex flex-col gap-2 flex-1">
        <div
          className="flex h-24 w-full py-4 px-6"
          style={{ borderBottom: "1px solid #B0BBC9" }}
        >
          <img
            src="/public\Assets\Images\logo3.png"
            className="object-contain"
            alt=""
          />
        </div>
        <div className="flex flex-col justify-center gap-8 w-3/4 md:items-center p-6">
          <h1 className="CallLog-title">Call Log</h1>
        </div>
      </div>
    </div>
  );
}
