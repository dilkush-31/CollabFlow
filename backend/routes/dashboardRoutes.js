const express = require("express");
const { getSummary, getOverview } = require("../controllers/dashboardController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.get("/summary", getSummary);
router.get("/overview", getOverview);

module.exports = router;