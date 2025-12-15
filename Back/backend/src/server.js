require("dotenv").config({ path: process.env.ENV_FILE || ".env" });
const path = require("path");
const express = require("express");
const cors = require("cors");
const { createSupabaseClient } = require("./db");
const buildTasksRouter = require("./routes/tasks");

const app = express();
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "1mb" }));

let supabase;
try {
  supabase = createSupabaseClient();
} catch (err) {
  console.error("Erreur de configuration Supabase :", err.message);
  process.exit(1);
}

app.use("/api/tasks", buildTasksRouter(supabase));
app.use(express.static(path.join(__dirname, "../../../Front/frontend")));

// Pour permettre le rechargement côté navigateur sur les routes (SPA)
// Pour Express v5+, utilisez exactement ceci pour matcher tout sauf les routes API :
app.get(/^(?!\/api\/).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, '../../Front/frontend/index.html'));
});

app.use((err, _req, res, _next) => {
  console.error("STACK:", err && (err.stack || err));
  res.status(500).json({ error: "Erreur interne du serveur." });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

