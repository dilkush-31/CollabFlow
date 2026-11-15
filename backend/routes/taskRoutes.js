const express = require("express");
const { updateExistingTask } = require("../controllers/taskController");
const { listComments, addComment } = require("../controllers/commentController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.patch("/:id", updateExistingTask);
router.get("/:id/comments", listComments);
router.post("/:id/comments", addComment);

module.exports = router;