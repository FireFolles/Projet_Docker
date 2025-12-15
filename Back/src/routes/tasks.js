const express = require("express");
const {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/tasks");

function buildTasksRouter(supabase) {
  const router = express.Router();

  router.get("/", listTasks(supabase));
  router.post("/", createTask(supabase));
  router.put("/:id", updateTask(supabase));
  router.delete("/:id", deleteTask(supabase));

  return router;
}

module.exports = buildTasksRouter;

