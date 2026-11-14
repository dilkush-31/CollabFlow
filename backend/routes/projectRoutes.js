const express = require("express");
const {
  listProjects,
  createNewProject,
  getProject,
  addProjectMember,
} = require("../controllers/projectController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Every project route requires a logged-in user
router.use(authenticate);

router.get("/", listProjects);
router.post("/", authorize("admin", "project_manager"), createNewProject);
router.get("/:id", getProject);
router.post("/:id/members", addProjectMember);

module.exports = router;