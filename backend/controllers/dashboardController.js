const { countProjects, countTasks } = require("../models/dashboardModel");

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

module.exports = { getSummary };