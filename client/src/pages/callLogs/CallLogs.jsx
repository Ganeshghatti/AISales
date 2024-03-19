import React, { useState, useEffect } from "react";
import axios from "axios";
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

import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';

const REACT_APP_BACK_URL = process.env.REACT_APP_BACK_URL; // Ensure your API URL is stored in the .env file

const CallLogs = () => {
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
    
    <TableContainer component={Paper} style={{ maxHeight: 400, overflow: 'auto' }}>
       <Panel tab="Call Logs" />
      <Table stickyHeader aria-label="call logs table">
        <TableHead>
          <TableRow>
            <TableCell>Call ID</TableCell>
            <TableCell>Created On</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>To</TableCell>
            <TableCell>From</TableCell>
            <TableCell>Recording</TableCell>
            <TableCell>Call Length</TableCell>
            <TableCell>Cost</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Transcript</TableCell>
            <TableCell>Variables</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {callLogs.map((log, index) => (
            <TableRow key={index}>
              <TableCell>{log.id}</TableCell>
              <TableCell>{log.createdOn}</TableCell>
              <TableCell>{log.type}</TableCell>
              <TableCell>{log.to}</TableCell>
              <TableCell>{log.from}</TableCell>
              <TableCell>{log.recording ? "Yes" : "No recording"}</TableCell>
              <TableCell>{log.callLength}</TableCell>
              <TableCell>{log.cost}</TableCell>
              <TableCell>{log.status}</TableCell>
              <TableCell>
                {log.transcript ? <Button onClick={() => {/* handle viewing transcript */}}>View</Button> : "N/A"}
              </TableCell>
              <TableCell>
                {log.variables ? <Button onClick={() => {/* handle viewing variables */}}>View</Button> : "N/A"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CallLogs;
