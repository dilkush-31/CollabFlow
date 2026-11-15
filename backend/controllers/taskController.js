const {
  getTasksByProject,
  findTaskById,
  createTask,
  updateTask,
} = require("../models/taskModel");
const { findProjectById, getMembership } = require("../models/projectModel");

const STATUSES = ["todo", "in_progress", "completed"];
const PRIORITIES = ["low", "medium", "high"];
const { createNotification } = require("../services/notificationService");
const { logActivity } = require("../services/activityService");
const { emitToProject } = require("../sockets");

// Returns "manager", "member", or null. Admins always count as managers.
const getAccess = async (user, projectId) => {
  if (user.role === "admin") return "manager";
  const membership = await getMembership(projectId, user.id);
  return membership ? membership.role : null;
};

const listTasks = async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const access = await getAccess(req.user, projectId);
    if (!access) {
      return res.status(403).json({ message: "You are not a member of this project" });
    }

    const tasks = await getTasksByProject(projectId);
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: "Could not load tasks", error: error.message });
  }
};

const createNewTask = async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const { title, description, priority = "medium", deadline, assignedTo } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Task title is required" });
    }
    if (!PRIORITIES.includes(priority)) {
      return res.status(400).json({ message: "Priority must be low, medium or high" });
    }

    const project = await findProjectById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const access = await getAccess(req.user, projectId);
    if (access !== "manager") {
      return res.status(403).json({ message: "Only project managers can create tasks" });
    }

    // An assignee must already be a project member
    if (assignedTo) {
      const assigneeMembership = await getMembership(projectId, assignedTo);
      if (!assigneeMembership) {
        return res.status(400).json({ message: "Assignee must be a project member" });
      }
    }

    const taskId = await createTask({
      projectId,
      title: title.trim(),
      description,
      priority,
      deadline,
      assignedTo,
      createdBy: req.user.id,
    });

    const task = await findTaskById(taskId);
    emitToProject(projectId, "task:created", task);

await logActivity({
  projectId,
  userId: req.user.id,
  action: "task_created",
  details: task.title,
});

if (task.assigned_to && task.assigned_to !== req.user.id) {
  await createNotification({
    userId: task.assigned_to,
    type: "task_assigned",
    message: `You were assigned "${task.title}"`,
    taskId: task.id,
  });
}
    res.status(201).json({ message: "Task created", task });
  } catch (error) {
    res.status(500).json({ message: "Could not create task", error: error.message });
  }
};

const updateExistingTask = async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    const task = await findTaskById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const access = await getAccess(req.user, task.project_id);
    if (!access) {
      return res.status(403).json({ message: "You are not a member of this project" });
    }

    const { title, description, status, priority, deadline, assignedTo } = req.body;
    const isManager = access === "manager";

    if (!isManager) {
      // Team members may only change the status of their own tasks
      const isAssignee = task.assigned_to === req.user.id;
      const onlyStatus = Object.keys(req.body).every((key) => key === "status");
      if (!isAssignee || !onlyStatus) {
        return res.status(403).json({ message: "You can only update the status of your own tasks" });
      }
    }

    if (status !== undefined && !STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    if (priority !== undefined && !PRIORITIES.includes(priority)) {
      return res.status(400).json({ message: "Invalid priority" });
    }
    if (assignedTo) {
      const assigneeMembership = await getMembership(task.project_id, assignedTo);
      if (!assigneeMembership) {
        return res.status(400).json({ message: "Assignee must be a project member" });
      }
    }

    const fields = {};
    if (title !== undefined) fields.title = title.trim();
    if (description !== undefined) fields.description = description;
    if (status !== undefined) fields.status = status;
    if (priority !== undefined) fields.priority = priority;
    if (deadline !== undefined) fields.deadline = deadline || null;
    if (assignedTo !== undefined) fields.assigned_to = assignedTo || null;

    await updateTask(taskId, fields);

    const updated = await findTaskById(taskId);
    emitToProject(task.project_id, "task:updated", updated);

await logActivity({
  projectId: task.project_id,
  userId: req.user.id,
  action: "task_updated",
  details: `${updated.title}: ${Object.keys(fields).join(", ")}`,
});

if (fields.assigned_to && fields.assigned_to !== task.assigned_to && fields.assigned_to !== req.user.id) {
  await createNotification({
    userId: fields.assigned_to,
    type: "task_assigned",
    message: `You were assigned "${updated.title}"`,
    taskId: updated.id,
  });
}

    res.json({ message: "Task updated", task: updated });
  } catch (error) {
    res.status(500).json({ message: "Could not update task", error: error.message });
  }
};

module.exports = { listTasks, createNewTask, updateExistingTask };