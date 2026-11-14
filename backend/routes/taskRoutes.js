const express = require("express");
const { updateExistingTask } = require("../controllers/taskController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.patch("/:id", updateExistingTask);

module.exports = router;