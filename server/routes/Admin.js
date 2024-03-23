const express = require("express");
const router = express.Router();
const { AdminLogin, GetAllVoices, SingleCall, BulkCall, GetCallLogs, GetTranscript} = require("../Controller/Admin");
const requireAuth = require("../middleware/Admin");

// Existing routes
router.route("/admin/login").post(AdminLogin);
router.route("/admin/get-all-voices").get(requireAuth, GetAllVoices);
router.route("/admin/single-call").post(requireAuth, SingleCall);
router.route("/admin/bulk-call").post(requireAuth, BulkCall);
router.route("/admin/call-logs").get(requireAuth, GetCallLogs);
router.route("/admin/get-transcript/:callId").get(requireAuth, GetTranscript);


module.exports = router;
