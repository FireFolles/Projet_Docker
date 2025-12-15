const {
  validateDescription,
  validateCompleted,
  validateId,
} = require("../validators/tasks");

const normalizeTask = (row) => ({
  id: row.id,
  description: row.task_description,
  completed: !!row.is_completed,
  created_at: row.created_at,
});

function listTasks(supabase) {
  return async (_req, res, next) => {
    try {
      const { data, error } = await supabase
        .from("todos")
        .select("id, task_description, is_completed, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        return res.status(500).json({ error: "Impossible de récupérer les tâches." });
      }

      res.json((data || []).map(normalizeTask));
    } catch (err) {
      next(err);
    }
  };
}

function createTask(supabase) {
  return async (req, res, next) => {
    try {
      const { value: description, error: validationError } = validateDescription(
        req.body?.description
      );
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      const { data, error } = await supabase
        .from("todos")
        .insert({
          task_description: description,
          is_completed: false,
        })
        .select("id, task_description, is_completed, created_at")
        .single();

      if (error) {
        return res.status(500).json({ error: "Erreur lors de la création de la tâche." });
      }

      res.status(201).json(normalizeTask(data));
    } catch (err) {
      next(err);
    }
  };
}

function updateTask(supabase) {
  return async (req, res, next) => {
    try {
      const { error: idError } = validateId(req.params.id);
      if (idError) {
        return res.status(400).json({ error: idError });
      }

      const updates = {};

      if (req.body?.description !== undefined) {
        const { value, error } = validateDescription(req.body.description);
        if (error) {
          return res.status(400).json({ error });
        }
        updates.task_description = value;
      }

      if (req.body?.completed !== undefined) {
        const { value, error } = validateCompleted(req.body.completed);
        if (error) {
          return res.status(400).json({ error });
        }
        updates.is_completed = value;
      }

      if (!Object.keys(updates).length) {
        return res.status(400).json({ error: "Aucune donnée à mettre à jour." });
      }

      const { data, error } = await supabase
        .from("todos")
        .update(updates)
        .eq("id", req.params.id)
        .select("id, task_description, is_completed, created_at")
        .single();

      if (error) {
        if (error.code === "PGRST116" || error.details?.includes("Results contain 0 rows")) {
          return res.status(404).json({ error: "Tâche introuvable." });
        }
        return res.status(500).json({ error: "Erreur lors de la mise à jour." });
      }

      res.json(normalizeTask(data));
    } catch (err) {
      next(err);
    }
  };
}

function deleteTask(supabase) {
  return async (req, res, next) => {
    try {
      const { error: idError } = validateId(req.params.id);
      if (idError) {
        return res.status(400).json({ error: idError });
      }

      const { error } = await supabase
        .from("todos")
        .delete()
        .eq("id", req.params.id)
        .select("id")
        .single();

      if (error) {
        if (error.code === "PGRST116" || error.details?.includes("Results contain 0 rows")) {
          return res.status(404).json({ error: "Tâche introuvable." });
        }
        return res.status(500).json({ error: "Erreur lors de la suppression." });
      }

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
};

