const {
  createProject,
  findProjectById,
  getAllProjects,
  getProjectsForUser,
  getMembership,
  getMembers,
  addMember,
} = require("../models/projectModel");
const { findUserByEmail } = require("../models/userModel");

// Returns "manager", "member", or null. Admins always count as managers.
const getAccess = async (user, projectId) => {
  if (user.role === "admin") return "manager";
  const membership = await getMembership(projectId, user.id);
  return membership ? membership.role : null;
};

const listProjects = async (req, res) => {
  try {
    const projects =
      req.user.role === "admin"
        ? await getAllProjects()
        : await getProjectsForUser(req.user.id);
    res.json({ projects });
  } catch (error) {
    res.status(500).json({ message: "Could not load projects", error: error.message });
  }
};

const createNewProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const projectId = await createProject({
      name: name.trim(),
      description,
      createdBy: req.user.id,
    });

    // The creator becomes the project's manager
    await addMember({ projectId, userId: req.user.id, role: "manager" });

    const project = await findProjectById(projectId);
    res.status(201).json({ message: "Project created", project });
  } catch (error) {
    res.status(500).json({ message: "Could not create project", error: error.message });
  }
};

const getProject = async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const project = await findProjectById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const access = await getAccess(req.user, projectId);
    if (!access) {
      return res.status(403).json({ message: "You are not a member of this project" });
    }

    const members = await getMembers(projectId);
    res.json({ project, myRole: access, members });
  } catch (error) {
    res.status(500).json({ message: "Could not load project", error: error.message });
  }
};

const addProjectMember = async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const { email, role = "member" } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!["manager", "member"].includes(role)) {
      return res.status(400).json({ message: "Role must be 'manager' or 'member'" });
    }

    const project = await findProjectById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const access = await getAccess(req.user, projectId);
    if (access !== "manager") {
      return res.status(403).json({ message: "Only project managers can add members" });
    }

    const user = await findUserByEmail(email.trim().toLowerCase());
    if (!user) {
      return res.status(404).json({ message: "No user with that email" });
    }

    const existing = await getMembership(projectId, user.id);
    if (existing) {
      return res.status(409).json({ message: "User is already a member" });
    }

    await addMember({ projectId, userId: user.id, role });
    res.status(201).json({ message: "Member added" });
  } catch (error) {
    res.status(500).json({ message: "Could not add member", error: error.message });
  }
};

module.exports = { listProjects, createNewProject, getProject, addProjectMember };