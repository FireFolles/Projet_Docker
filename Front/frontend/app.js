const API_BASE = "/api/tasks";

const form = document.getElementById("task-form");
const input = document.getElementById("task-description");
const list = document.getElementById("tasks-list");
const feedback = document.getElementById("feedback");
const refreshBtn = document.getElementById("refresh-btn");

async function fetchTasks() {
  try {
    feedback.textContent = "";
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error("Impossible de récupérer les tâches.");
    const tasks = await res.json();
    renderTasks(tasks);
  } catch (err) {
    feedback.textContent = err.message;
  }
}

async function addTask(description) {
  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Erreur lors de l'ajout.");
    }
    await fetchTasks();
    input.value = "";
    input.focus();
  } catch (err) {
    feedback.textContent = err.message;
  }
}

async function toggleTask(id, completed) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Erreur lors de la mise à jour.");
    }
    await fetchTasks();
  } catch (err) {
    feedback.textContent = err.message;
  }
}

async function deleteTask(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Erreur lors de la suppression.");
    }
    await fetchTasks();
  } catch (err) {
    feedback.textContent = err.message;
  }
}

function renderTasks(tasks) {
  list.innerHTML = "";
  if (!tasks.length) {
    list.innerHTML = `<li class="empty">Aucune tâche pour le moment. Ajoutez-en une !</li>`;
    return;
  }

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = `task ${task.completed ? "completed" : ""}`;

    const main = document.createElement("main");
    const titleEl = document.createElement("p");
    titleEl.className = "task-title";
    titleEl.textContent = task.description;
    main.appendChild(titleEl);

    const meta = document.createElement("p");
    meta.className = "task-meta";
    const created = new Date(task.created_at);
    meta.textContent = `Créée le ${created.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`;
    main.appendChild(meta);

    const badge = document.createElement("span");
    badge.className = `badge ${task.completed ? "success" : "info"}`;
    badge.textContent = task.completed ? "Terminée" : "À faire";

    const actions = document.createElement("div");
    actions.className = "actions";

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "ghost";
    toggleBtn.textContent = task.completed ? "Marquer à faire" : "Marquer terminée";
    toggleBtn.addEventListener("click", () => toggleTask(task.id, !task.completed));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "danger";
    deleteBtn.textContent = "Supprimer";
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    actions.appendChild(badge);
    actions.appendChild(toggleBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(main);
    li.appendChild(actions);
    list.appendChild(li);
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const description = input.value.trim();
  if (!description) {
    feedback.textContent = "Veuillez saisir une description.";
    return;
  }
  addTask(description);
});

refreshBtn.addEventListener("click", () => fetchTasks());

fetchTasks();

