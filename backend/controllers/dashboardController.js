const {
  countProjects,
  countTasks,
  getOverdueTasks,
  getProjectProgress,
} = require("../models/dashboardModel");

const getSummary = async (req, res) => {
  try {
    const [projects, tasks] = await Promise.all([
      countProjects(req.user),
      countTasks(req.user),
    ]);
    res.json({ projects, tasks });
  } catch (error) {
    res.status(500).json({ message: "Could not load dashboard", error: error.message });
  }
};

const getOverview = async (req, res) => {
  try {
    const [overdue, progress] = await Promise.all([
      getOverdueTasks(req.user),
      getProjectProgress(req.user),
    ]);
    res.json({ overdue, progress });
  } catch (error) {
    res.status(500).json({ message: "Could not load overview", error: error.message });
  }
};

module.exports = { getSummary, getOverview };