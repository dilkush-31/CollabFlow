const {
  createComment,
  getCommentsByTask,
  findCommentWithAuthor,
} = require("../models/commentModel");
const { findTaskById } = require("../models/taskModel");
const { getMembership } = require("../models/projectModel");
const { createNotification } = require("../services/notificationService");
const { logActivity } = require("../services/activityService");
const { emitToProject } = require("../sockets");

// Any project member can read and comment. Admins can always access.
const canAccessProject = async (user, projectId) => {
  if (user.role === "admin") return true;
  return Boolean(await getMembership(projectId, user.id));
};

const listComments = async (req, res) => {
  try {
    const task = await findTaskById(Number(req.params.id));
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (!(await canAccessProject(req.user, task.project_id))) {
      return res.status(403).json({ message: "You are not a member of this project" });
    }

    const comments = await getCommentsByTask(task.id);
    res.json({ comments });
  } catch (error) {
    res.status(500).json({ message: "Could not load comments", error: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const task = await findTaskById(Number(req.params.id));
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (!(await canAccessProject(req.user, task.project_id))) {
      return res.status(403).json({ message: "You are not a member of this project" });
    }

    const content = (req.body.content || "").trim();
    if (!content) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }
    if (content.length > 1000) {
      return res.status(400).json({ message: "Comment must be 1000 characters or fewer" });
    }

    const commentId = await createComment({
      taskId: task.id,
      userId: req.user.id,
      content,
    });

    const comment = await findCommentWithAuthor(commentId);

    emitToProject(task.project_id, "comment:new", comment);

    // Tell the assignee, unless they wrote the comment
    if (task.assigned_to && task.assigned_to !== req.user.id) {
      await createNotification({
        userId: task.assigned_to,
        type: "comment",
        message: `${comment.author_name} commented on "${task.title}"`,
        taskId: task.id,
      });
    }

    await logActivity({
      projectId: task.project_id,
      userId: req.user.id,
      action: "comment_added",
      details: task.title,
    });

    res.status(201).json({ message: "Comment added", comment });
  } catch (error) {
    res.status(500).json({ message: "Could not add comment", error: error.message });
  }
};

module.exports = { listComments, addComment };